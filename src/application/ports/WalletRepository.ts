import { WalletTransaction } from "../../domain/wallet/WalletTransaction";

export interface StoredWallet {
    id: number;
    balanceInCents: number;
    ownerId: number;
}

export interface WalletRepository {
    findByOwnerId(ownerId: number): Promise<StoredWallet | null>;
    setBalance(ownerId: number, balanceInCents: number): Promise<void>;
    increaseBalance(ownerId: number, amountInCents: number): Promise<void>;
    addHistory(transaction: WalletTransaction): Promise<void>;
}
