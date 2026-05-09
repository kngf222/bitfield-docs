import { sendRequestToBitfieldTarget } from '@bitfield/runtime-kit';
import { useBitfieldData } from '@bitfield/runtime-kit/react';
import { useState } from 'react';

type WelcomeData = {
  headline: string;
  body: string;
};

export function WelcomePanel() {
  const welcome = useBitfieldData<WelcomeData>('welcome');
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function refresh() {
    setRequestMessage(null);
    setRequestError(null);

    try {
      await sendRequestToBitfieldTarget({
        target: 'product.search',
        payload: { reason: 'refresh-welcome-panel' },
      });
      setRequestMessage('Refresh request sent.');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Refresh request failed.');
    }
  }

  if (welcome.loading) return <section>Loading welcome panel.</section>;
  if (welcome.error) return <section>Could not load this panel.</section>;
  if (!welcome.data) return <section>No welcome copy yet.</section>;

  return (
    <section>
      <h2>{welcome.data.headline}</h2>
      <p>{welcome.data.body}</p>
      <button type="button" onClick={refresh}>
        Refresh
      </button>
      {requestError ? <p>{requestError}</p> : null}
      {requestMessage ? <p>{requestMessage}</p> : null}
    </section>
  );
}
