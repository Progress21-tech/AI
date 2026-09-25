import { redirect } from 'next/navigation';

// Send public visitors to the discovery-call form while keeping saved interview records intact.
export default function DiscoveryStartPage() {
  redirect('/book-a-call');
}
