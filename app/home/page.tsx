"use client"
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import { verifyProof } from '../actions/verify-proof';
import { MiniKit, Tokens } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { type Chain, createPublicClient, http } from 'viem';
import DEXABI from '@/app/abi/DEX.json';

const worldchain: Chain = {
  id: 0x1e0,
  name: 'Worldchain',
  nativeCurrency: {
    name: 'Worldcoin',
    symbol: 'WDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: { name: 'Worldchain Explorer', url: 'https://explorer.worldchain.io' },
  },
}

const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

const permitTransfer = {
  permitted: {
    token: Tokens.WLD,
    amount: '10000',
  },
  nonce: Date.now().toString(),
  deadline,
}

const permitTransferArgsForm = [
  [permitTransfer.permitted.token, permitTransfer.permitted.amount],
  permitTransfer.nonce,
  permitTransfer.deadline,
]

const transferDetails = {
  to: '0x126f7998Eb44Dd2d097A8AB2eBcb28dEA1646AC8',
  requestedAmount: '10000',
}

const transferDetailsArgsForm = [transferDetails.to, transferDetails.requestedAmount]

export default function Home() {
  const onSuccess = () => {
    console.log("Success")
  };

  const [transactionId, setTransactionId] = useState<string>('')

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    client: client,
    appConfig: {
      app_id: 'app_staging_7c78da1425e707d4e9c34e6959379d58',
    },
    transactionId: transactionId,
  });

  const sendTransaction = async () => {
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit is not installed');
      return;
    }

    const {commandPayload, finalPayload} = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: '0x34afd47fbdcc37344d1eb6a2ed53b253d4392a2f',
          abi: DEXABI,
          functionName: 'signatureTransfer',
          args: [permitTransferArgsForm, transferDetailsArgsForm, 'PERMIT2_SIGNATURE_PLACEHOLDER_0'],
        },
      ],
      permit2: [
        {
          ...permitTransfer,
          spender: '0x34afd47fbdcc37344d1eb6a2ed53b253d4392a2f',
        },
      ],
    });

    if (finalPayload.status === 'error') {
      console.error('Error sending transaction', finalPayload)
    } else {
      setTransactionId(finalPayload.transaction_id)
    }
  };

  useEffect(() => {
		// Passing appId in the install is optional
		// but allows you to access it later via `window.MiniKit.appId`
		MiniKit.install("app_staging_7c78da1425e707d4e9c34e6959379d58");
	}, [])

  return (
    <>
      <button
        type="button"
        onClick={sendTransaction}
      >
        Send Transaction
      </button>

      {isConfirming && <p>Confirming...</p>}
      {isConfirmed && <p>Confirmed!</p>}

      <IDKitWidget
          app_id="app_staging_7c78da1425e707d4e9c34e6959379d58"
          action="test"
          verification_level={VerificationLevel.Orb}
          handleVerify={verifyProof}
          onSuccess={onSuccess}>
          {({ open }) => (
            <button
              type="button"
              onClick={open}
            >
              Verify with World ID
            </button>
          )}
      </IDKitWidget>
    </>
  );
};
