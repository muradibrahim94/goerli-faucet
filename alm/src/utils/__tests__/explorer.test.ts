import 'jest'
import {
  getFailedTransactions,
  getSuccessTransactions,
  filterValidatorSignatureTransaction,
  getExecutionFailedTransactionForMessage,
  APITransaction,
  getValidatorPendingTransactionsForMessage,
  getExecutionPendingTransactionsForMessage
} from '../explorer'
import { EXECUTE_AFFIRMATION_HASH, EXECUTE_SIGNATURES_HASH, SUBMIT_SIGNATURE_HASH } from '../../config/constants'

const messageData = '0x123456'
const OTHER_HASH = 'aabbccdd'
const bridgeAddress = '0xFe446bEF1DbF7AFE24E81e05BC8B271C1BA9a560'
const otherAddress = '0xD4075FB57fCf038bFc702c915Ef9592534bED5c1'
const validator1 = '0x45b96809336A8b714BFbdAB3E4B5e0fe5d839908'
const validator2 = '0xAe8bFfc8BBc6AAa9E21ED1E4e4957fe798BEA25f'
const validator3 = '0x285A6eB779be4db94dA65e2F3518B1c5F0f71244'

describe('getFailedTransactions', () => {
  test('should only return failed transactions', async () => {
    const to = otherAddress
    const transactions = [
      { isError: '0', to, from: validator1 },
      { isError: '1', to, from: validator1 },
      { isError: '0', to, from: validator2 },
      { isError: '1', to, from: validator2 },
      { isError: '1', to, from: validator3 }
    ]

    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)
    const result = await getFailedTransactions(validator1, to, 0, 1, '', fetchAccountTransactions)
    expect(result.length).toEqual(1)
  })
})
describe('getSuccessTransactions', () => {
  test('should only return success transactions', async () => {
    const to = otherAddress
    const transactions = [
      { isError: '0', to, from: validator1 },
      { isError: '1', to, from: validator1 },
      { isError: '0', to, from: validator2 },
      { isError: '1', to, from: validator2 },
      { isError: '1', to, from: validator3 }
    ]

    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)
    const result = await getSuccessTransactions(validator1, to, 0, 1, '', fetchAccountTransactions)
    expect(result.length).toEqual(1)
  })
})
describe('filterValidatorSignatureTransaction', () => {
  test('should return submit signatures related transaction', () => {
    const transactions = [
      { input: `0x${SUBMIT_SIGNATURE_HASH}112233` },
      { input: `0x${SUBMIT_SIGNATURE_HASH}123456` },
      { input: `0x${OTHER_HASH}123456` },
      { input: `0x${OTHER_HASH}112233` }
    ] as APITransaction[]

    const result = filterValidatorSignatureTransaction(transactions, messageData)
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${SUBMIT_SIGNATURE_HASH}123456` })
  })
  test('should return execute affirmation related transaction', () => {
    const transactions = [
      { input: `0x${EXECUTE_AFFIRMATION_HASH}112233` },
      { input: `0x${EXECUTE_AFFIRMATION_HASH}123456` },
      { input: `0x${OTHER_HASH}123456` },
      { input: `0x${OTHER_HASH}112233` }
    ] as APITransaction[]

    const result = filterValidatorSignatureTransaction(transactions, messageData)
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${EXECUTE_AFFIRMATION_HASH}123456` })
  })
})
describe('getExecutionFailedTransactionForMessage', () => {
  test('should return failed transaction related to signatures execution', async () => {
    const transactions = [
      { input: `0x${EXECUTE_SIGNATURES_HASH}112233` },
      { input: `0x${EXECUTE_SIGNATURES_HASH}123456` },
      { input: `0x${OTHER_HASH}123456` },
      { input: `0x${OTHER_HASH}112233` }
    ] as APITransaction[]
    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)

    const result = await getExecutionFailedTransactionForMessage(
      {
        account: '',
        to: '',
        messageData,
        startBlock: 0,
        endBlock: 1
      },
      fetchAccountTransactions
    )
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${EXECUTE_SIGNATURES_HASH}123456` })
  })
})
describe('getValidatorPendingTransactionsForMessage', () => {
  test('should return pending transaction for submit signature transaction', async () => {
    const transactions = [
      { input: `0x${SUBMIT_SIGNATURE_HASH}112233`, to: bridgeAddress },
      { input: `0x${SUBMIT_SIGNATURE_HASH}123456`, to: bridgeAddress },
      { input: `0x${SUBMIT_SIGNATURE_HASH}123456`, to: otherAddress },
      { input: `0x${OTHER_HASH}123456`, to: bridgeAddress },
      { input: `0x${OTHER_HASH}112233`, to: bridgeAddress }
    ] as APITransaction[]
    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)

    const result = await getValidatorPendingTransactionsForMessage(
      {
        account: '',
        to: bridgeAddress,
        messageData
      },
      fetchAccountTransactions
    )

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${SUBMIT_SIGNATURE_HASH}123456`, to: bridgeAddress })
  })
  test('should return pending transaction for execute affirmation transaction', async () => {
    const transactions = [
      { input: `0x${EXECUTE_AFFIRMATION_HASH}112233`, to: bridgeAddress },
      { input: `0x${EXECUTE_AFFIRMATION_HASH}123456`, to: bridgeAddress },
      { input: `0x${EXECUTE_AFFIRMATION_HASH}123456`, to: otherAddress },
      { input: `0x${OTHER_HASH}123456`, to: bridgeAddress },
      { input: `0x${OTHER_HASH}112233`, to: bridgeAddress }
    ] as APITransaction[]
    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)

    const result = await getValidatorPendingTransactionsForMessage(
      {
        account: '',
        to: bridgeAddress,
        messageData
      },
      fetchAccountTransactions
    )

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${EXECUTE_AFFIRMATION_HASH}123456`, to: bridgeAddress })
  })
})
describe('getExecutionPendingTransactionsForMessage', () => {
  test('should return pending transaction for signatures execution transaction', async () => {
    const transactions = [
      { input: `0x${EXECUTE_SIGNATURES_HASH}112233`, to: bridgeAddress },
      { input: `0x${EXECUTE_SIGNATURES_HASH}123456`, to: bridgeAddress },
      { input: `0x${EXECUTE_SIGNATURES_HASH}123456`, to: otherAddress },
      { input: `0x${OTHER_HASH}123456`, to: bridgeAddress },
      { input: `0x${OTHER_HASH}112233`, to: bridgeAddress }
    ] as APITransaction[]
    const fetchAccountTransactions = jest.fn().mockImplementation(() => transactions)

    const result = await getExecutionPendingTransactionsForMessage(
      {
        account: '',
        to: bridgeAddress,
        messageData
      },
      fetchAccountTransactions
    )

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({ input: `0x${EXECUTE_SIGNATURES_HASH}123456`, to: bridgeAddress })
  })
})
