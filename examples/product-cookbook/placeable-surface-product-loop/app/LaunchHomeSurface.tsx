import { sendRequestToBitfieldTarget } from '@bitfield/runtime-kit';
import { useBitfieldData } from '@bitfield/runtime-kit/react';
import type { PlaceableSurface } from './surfaces';

type WelcomeCopy = {
  headline: string;
  body: string;
};

type Checklist = {
  items: Array<{ id: string; label: string; done: boolean }>;
};

type NextStepReply = {
  nextStep: string;
  reason: string;
};

export function LaunchHomeSurface({ surface }: { surface: PlaceableSurface }) {
  const welcome = useBitfieldData<WelcomeCopy>('welcome-copy');
  const checklist = useBitfieldData<Checklist>('launch-checklist');

  async function getNextStep(): Promise<NextStepReply> {
    const reply = await sendRequestToBitfieldTarget({
      target: 'launch.next-step',
      payload: {
        surfaceId: surface.id,
        completed: checklist.data?.items.filter((item) => item.done).map((item) => item.id) ?? [],
      },
    });

    return JSON.parse(new TextDecoder().decode(reply.payload)) as NextStepReply;
  }

  if (welcome.loading || checklist.loading) return <section>Loading.</section>;
  if (welcome.error || checklist.error) return <section>Could not load this surface.</section>;
  if (!welcome.data || !checklist.data) return <section>No data yet.</section>;

  return (
    <section>
      <h2>{welcome.data.headline}</h2>
      <p>{welcome.data.body}</p>

      {checklist.data.items.map((item) => (
        <p key={item.id}>{item.done ? 'Done' : 'Next'}: {item.label}</p>
      ))}

      <button type="button" onClick={getNextStep}>
        Show next step
      </button>
    </section>
  );
}
