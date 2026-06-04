import { useSync } from '@tldraw/sync'
import { ReactNode, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Tldraw, uniqueId, type Editor } from 'tldraw'
import { getBookmarkPreview } from '../getBookmarkPreview'
import { multiplayerAssetStore } from '../multiplayerAssetStore'

export function Room() {
	const { roomId } = useParams<{ roomId: string }>()
	const [searchParams] = useSearchParams()
	const [editor, setEditor] = useState<Editor | null>(null)

	const isViewOnly = searchParams.get('mode') === 'view'

	const store = useSync({
		uri: `${window.location.origin}/api/connect/${roomId}`,
		assets: multiplayerAssetStore,
	})

	useEffect(() => {
		if (!editor) return

		editor.updateInstanceState({
			isReadonly: isViewOnly,
			isToolLocked: !isViewOnly,
		})
	}, [editor, isViewOnly])

	return (
		<RoomWrapper roomId={roomId} isViewOnly={isViewOnly}>
			<Tldraw
				licenseKey="tldraw-2026-09-11/WyJBNldYd3FRUyIsWyIqIl0sMTYsIjIwMjYtMDktMTEiXQ.8V/ptb/zJNzvqvlla65XeqQy0LPT1Tzg6F75oDitk+FstGiAFiqRNxuty+jcdG6PqKlAsmq9dY8912vnKso9Yg"
				store={store}
				options={{ deepLinks: true }}
				onMount={(editor) => {
					setEditor(editor)

					editor.user.updateUserPreferences({
						colorScheme: 'dark',
					})

					editor.updateInstanceState({
						isReadonly: isViewOnly,
						isToolLocked: !isViewOnly,
					})

					editor.registerExternalAssetHandler('url', getBookmarkPreview)
				}}
			/>
		</RoomWrapper>
	)
}

function RoomWrapper({
	children,
	roomId,
	isViewOnly,
}: {
	children: ReactNode
	roomId?: string
	isViewOnly: boolean
}) {
	const [copiedMessage, setCopiedMessage] = useState<string | null>(null)
	const navigate = useNavigate()

	useEffect(() => {
		if (!copiedMessage) return

		const timeout = setTimeout(() => setCopiedMessage(null), 2500)
		return () => clearTimeout(timeout)
	}, [copiedMessage])

	function copyEditLink() {
		navigator.clipboard.writeText(`${window.location.origin}/${roomId}?mode=edit`)
		setCopiedMessage('Edit link copied!')
	}

	function copyViewLink() {
		navigator.clipboard.writeText(`${window.location.origin}/${roomId}?mode=view`)
		setCopiedMessage('View link copied!')
	}

	function createNewBoard() {
		navigate(`/board-${uniqueId()}?mode=edit`)
	}

	return (
		<div style={styles.page}>
			<div style={styles.topbar}>
				<div style={styles.brand}>
					<div style={styles.logo}>D</div>

					<div style={styles.brandText}>
						<div style={styles.title}>DevBoard</div>
						<div style={styles.roomId}>Room: {roomId}</div>
					</div>
				</div>

				<div style={styles.divider} />

				<div style={styles.status}>
					<span style={styles.statusDot} />
					Live sync
				</div>

				<div style={isViewOnly ? styles.viewBadge : styles.editBadge}>
					{isViewOnly ? 'View only' : 'Edit mode'}
				</div>

				<div style={styles.divider} />

				<button style={styles.button} onClick={() => navigate('/')}>
					Home
				</button>

				<button style={styles.button} onClick={createNewBoard}>
					New board
				</button>

				<button style={styles.primaryButton} onClick={copyEditLink}>
					Edit link
					{copiedMessage && <div style={styles.copied}>{copiedMessage}</div>}
				</button>

				<button style={styles.button} onClick={copyViewLink}>
					View link
				</button>
			</div>

			<div style={styles.content}>{children}</div>
		</div>
	)
}

const styles: Record<string, CSSProperties> = {
	page: {
		position: 'fixed',
		inset: 0,
		background: '#0d1117',
		color: '#e6edf3',
		overflow: 'hidden',
		fontFamily:
			'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	},

	content: {
		position: 'absolute',
		inset: 0,
	},

	topbar: {
		position: 'absolute',
		top: 14,
		left: '50%',
		transform: 'translateX(-50%)',
		zIndex: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: 10,
		border: '1px solid rgba(139, 148, 158, 0.28)',
		borderRadius: 16,
		background: 'rgba(13, 17, 23, 0.94)',
		backdropFilter: 'blur(16px)',
		boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
		maxWidth: 'calc(100vw - 28px)',
		overflowX: 'auto',
	},

	brand: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		minWidth: 0,
		flexShrink: 0,
	},

	logo: {
		width: 34,
		height: 34,
		display: 'grid',
		placeItems: 'center',
		borderRadius: 10,
		background: '#1f6feb',
		color: '#ffffff',
		fontWeight: 900,
		flexShrink: 0,
	},

	brandText: {
		minWidth: 0,
	},

	title: {
		fontSize: 15,
		fontWeight: 900,
		lineHeight: 1,
		color: '#f0f6fc',
	},

	roomId: {
		marginTop: 5,
		maxWidth: 210,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		fontSize: 12,
		fontWeight: 600,
		color: '#8b949e',
	},

	divider: {
		width: 1,
		height: 30,
		background: 'rgba(139, 148, 158, 0.25)',
		flexShrink: 0,
	},

	status: {
		display: 'flex',
		alignItems: 'center',
		gap: 7,
		height: 36,
		padding: '0 12px',
		border: '1px solid rgba(63, 185, 80, 0.35)',
		borderRadius: 10,
		background: 'rgba(46, 160, 67, 0.14)',
		color: '#7ee787',
		fontSize: 13,
		fontWeight: 800,
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 999,
		background: '#3fb950',
		boxShadow: '0 0 12px rgba(63, 185, 80, 0.9)',
	},

	editBadge: {
		height: 36,
		display: 'flex',
		alignItems: 'center',
		padding: '0 12px',
		border: '1px solid rgba(63, 185, 80, 0.35)',
		borderRadius: 10,
		background: 'rgba(46, 160, 67, 0.14)',
		color: '#7ee787',
		fontSize: 13,
		fontWeight: 800,
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	viewBadge: {
		height: 36,
		display: 'flex',
		alignItems: 'center',
		padding: '0 12px',
		border: '1px solid rgba(210, 153, 34, 0.42)',
		borderRadius: 10,
		background: 'rgba(210, 153, 34, 0.14)',
		color: '#f2cc60',
		fontSize: 13,
		fontWeight: 800,
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	button: {
		height: 36,
		padding: '0 13px',
		border: '1px solid rgba(139, 148, 158, 0.32)',
		borderRadius: 10,
		background: '#21262d',
		color: '#e6edf3',
		fontSize: 13,
		fontWeight: 800,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	primaryButton: {
		position: 'relative',
		height: 36,
		padding: '0 13px',
		border: '1px solid rgba(88, 166, 255, 0.65)',
		borderRadius: 10,
		background: '#1f6feb',
		color: '#ffffff',
		fontSize: 13,
		fontWeight: 900,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	copied: {
		position: 'absolute',
		top: 44,
		right: 0,
		padding: '8px 10px',
		border: '1px solid rgba(63, 185, 80, 0.35)',
		borderRadius: 10,
		background: '#0d1117',
		color: '#7ee787',
		fontSize: 12,
		fontWeight: 900,
		whiteSpace: 'nowrap',
		boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
	},
}