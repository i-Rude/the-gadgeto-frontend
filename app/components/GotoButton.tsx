'use client';
import { useRouter } from 'next/navigation';

export default function GotoButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/home');
    };

    return (
        <button onClick={handleClick} className="flex items-center" style={{ color: '#00B7EB' }} >
            Go to Home Page
        </button>
    );
}
