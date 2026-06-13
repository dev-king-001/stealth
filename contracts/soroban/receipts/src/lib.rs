#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
};

#[contract]
pub struct ReceiptsContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Receipt {
    pub sender: Address,
    pub recipient: Address,
    pub delivered_at: u64,
    pub read_at: Option<u64>,
}

#[contracttype]
enum DataKey {
    Receipt(BytesN<32>),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    DuplicateReceipt = 1,
    ReceiptNotFound = 2,
    AlreadyRead = 3,
}

#[contractimpl]
impl ReceiptsContract {
    pub fn delivered(
        env: Env,
        message_id: BytesN<32>,
        sender: Address,
        recipient: Address,
    ) -> Result<Receipt, Error> {
        sender.require_auth();
        let key = DataKey::Receipt(message_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::DuplicateReceipt);
        }

        let receipt = Receipt {
            sender,
            recipient,
            delivered_at: env.ledger().timestamp(),
            read_at: None,
        };
        env.storage().persistent().set(&key, &receipt);
        env.events()
            .publish((symbol_short!("delivered"), message_id), receipt.clone());
        Ok(receipt)
    }

    pub fn read(env: Env, message_id: BytesN<32>) -> Result<Receipt, Error> {
        let key = DataKey::Receipt(message_id.clone());
        let mut receipt: Receipt = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::ReceiptNotFound)?;

        receipt.recipient.require_auth();
        if receipt.read_at.is_some() {
            return Err(Error::AlreadyRead);
        }

        receipt.read_at = Some(env.ledger().timestamp());
        env.storage().persistent().set(&key, &receipt);
        env.events()
            .publish((symbol_short!("read"), message_id), receipt.clone());
        Ok(receipt)
    }

    pub fn get(env: Env, message_id: BytesN<32>) -> Result<Receipt, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Receipt(message_id))
            .ok_or(Error::ReceiptNotFound)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    #[test]
    fn recipient_can_publish_read_receipt() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(ReceiptsContract, ());
        let client = ReceiptsContractClient::new(&env, &contract_id);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let message_id = BytesN::from_array(&env, &[7; 32]);

        env.ledger().set_timestamp(10);
        let delivered = client.delivered(&message_id, &sender, &recipient);
        assert_eq!(delivered.delivered_at, 10);
        assert_eq!(delivered.read_at, None);

        env.ledger().set_timestamp(20);
        let read = client.read(&message_id);
        assert_eq!(read.read_at, Some(20));
    }
}
