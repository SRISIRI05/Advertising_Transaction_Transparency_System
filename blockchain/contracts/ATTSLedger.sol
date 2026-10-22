// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ATTSLedger {
    enum RecordType { CAMPAIGN, PURCHASE, REPORT, PAYMENT }

    struct Transaction {
        uint256 id;
        RecordType recordType;
        string recordId;       // MongoDB ObjectId as string
        string dataHash;       // SHA-256 hash of the off-chain record
        address recordedBy;
        uint256 timestamp;
        bool exists;
    }

    uint256 private _txCount;
    mapping(uint256 => Transaction) private _transactions;
    mapping(string => uint256) private _recordIndex; // recordId => txId

    event TransactionRecorded(
        uint256 indexed txId,
        RecordType indexed recordType,
        string recordId,
        string dataHash,
        address recordedBy,
        uint256 timestamp
    );

    // Record a new transaction
    function recordTransaction(
        RecordType recordType,
        string calldata recordId,
        string calldata dataHash
    ) external returns (uint256) {
        require(bytes(recordId).length > 0, "recordId required");
        require(bytes(dataHash).length > 0, "dataHash required");
        require(_recordIndex[recordId] == 0, "Record already exists");

        _txCount++;
        _transactions[_txCount] = Transaction({
            id: _txCount,
            recordType: recordType,
            recordId: recordId,
            dataHash: dataHash,
            recordedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        _recordIndex[recordId] = _txCount;

        emit TransactionRecorded(_txCount, recordType, recordId, dataHash, msg.sender, block.timestamp);
        return _txCount;
    }

    // Verify a record's hash matches what was stored
    function verifyRecord(string calldata recordId, string calldata dataHash)
        external view returns (bool isValid, uint256 txId, uint256 timestamp)
    {
        txId = _recordIndex[recordId];
        if (txId == 0) return (false, 0, 0);
        Transaction storage t = _transactions[txId];
        isValid = keccak256(bytes(t.dataHash)) == keccak256(bytes(dataHash));
        timestamp = t.timestamp;
    }

    // Get transaction by ID
    function getTransaction(uint256 txId)
        external view returns (Transaction memory)
    {
        require(_transactions[txId].exists, "Transaction not found");
        return _transactions[txId];
    }

    // Get transaction by record ID
    function getTransactionByRecordId(string calldata recordId)
        external view returns (Transaction memory)
    {
        uint256 txId = _recordIndex[recordId];
        require(txId != 0, "Record not found");
        return _transactions[txId];
    }

    function totalTransactions() external view returns (uint256) {
        return _txCount;
    }
}
