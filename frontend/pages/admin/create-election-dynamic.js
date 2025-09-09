import dynamic from 'next/dynamic';
import Head from 'next/head';

const CreateElectionPage = dynamic(() => import('./create-election'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
});

export default function CreateElectionDynamic() {
  return (
    <>
      <Head>
        <title>Create Election - BlocPol</title>
        <meta name="description" content="Create a new election" />
      </Head>
      <CreateElectionPage />
    </>
  );
}
