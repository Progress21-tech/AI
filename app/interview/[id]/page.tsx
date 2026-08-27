import { redirect } from 'next/navigation';

export default function LegacyInterviewPage({ params }: { params: { id: string } }) {
  redirect(`/discovery/${params.id}`);
}
