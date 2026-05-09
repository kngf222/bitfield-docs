import { useRef } from 'react';
import { sendRequestToBitfieldTarget } from '@bitfield/runtime-kit';

type HelpSearchReply = {
  results: Array<{ title: string; excerpt: string }>;
};

export function LaunchHelpSurface() {
  const current = useRef<AbortController | null>(null);

  async function search(query: string): Promise<HelpSearchReply> {
    current.current?.abort();
    current.current = new AbortController();

    const reply = await sendRequestToBitfieldTarget(
      { target: 'help.search', payload: { query } },
      current.current.signal,
    );

    return JSON.parse(new TextDecoder().decode(reply.payload)) as HelpSearchReply;
  }

  return <button type="button" onClick={() => search('activation')}>Search help</button>;
}
