import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { cn } from '@roomi/ui';

export function AppShell() {
	const location = useLocation();
	const isFeedPage = location.pathname === '/';

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<main
				className={cn('flex-1')}
				style={!isFeedPage ? { paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' } : undefined}
			>
				<Outlet />
			</main>
			<BottomNav />
			<LoginModal />
		</div>
	);
}
