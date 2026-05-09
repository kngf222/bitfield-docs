import { sendRequestToBitfieldTarget } from '@bitfield/runtime-kit';
import { useBitfieldData } from '@bitfield/runtime-kit/react';

type WelcomeData = {
  headline: string;
  body: string;
};

export function WelcomePanel() {
  const welcome = useBitfieldData<WelcomeData>('welcome');

  async function refresh() {
    await sendRequestToBitfieldTarget({
      target: 'product.search',
      payload: { reason: 'refresh-welcome-panel' },
    });
  }

  if (welcome.loading) return <section>Loading</section>;
  if (welcome.error) return <section>Could not load this panel.</section>;
  if (!welcome.data) return null;

  return (
    <section>
      <h2>{welcome.data.headline}</h2>
      <p>{welcome.data.body}</p>
      <button type="button" onClick={refresh}>
        Refresh
      </button>
    </section>
  );
}
