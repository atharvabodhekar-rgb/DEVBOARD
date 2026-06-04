import { useSync } from '@tldraw/sync'
import { ReactNode, useEffect, useState, type CSSProperties, type ChangeEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Tldraw, createShapeId, toRichText, uniqueId, type Editor } from 'tldraw'
import { getBookmarkPreview } from '../getBookmarkPreview'
import { multiplayerAssetStore } from '../multiplayerAssetStore'

const TLDRAW_LICENSE_KEY =
	'tldraw-2026-09-11/WyJBNldYd3FRUyIsWyIqIl0sMTYsIjIwMjYtMDktMTEiXQ.8V/ptb/zJNzvqvlla65XeqQy0LPT1Tzg6F75oDitk+FstGiAFiqRNxuty+jcdG6PqKlAsmq9dY8912vnKso9Yg'

type BackgroundMode = 'plain' | 'grid' | 'dots' | 'lined'
type TemplateType = 'brainstorm' | 'wireframe' | 'retro' | 'mindmap'

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
		<RoomWrapper roomId={roomId} isViewOnly={isViewOnly} editor={editor}>
			<Tldraw
				licenseKey={TLDRAW_LICENSE_KEY}
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
	editor,
}: {
	children: ReactNode
	roomId?: string
	isViewOnly: boolean
	editor: Editor | null
}) {
	const [copiedMessage, setCopiedMessage] = useState<string | null>(null)
	const [background, setBackground] = useState<BackgroundMode>('grid')
	const [isMenuOpen, setIsMenuOpen] = useState(false)
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

	function getCenterPoint() {
		if (!editor) return { x: 0, y: 0 }

		const bounds = editor.getViewportPageBounds()

		return {
			x: bounds.x + bounds.w / 2,
			y: bounds.y + bounds.h / 2,
		}
	}

	function createTextShape(text: string, x: number, y: number, width = 260) {
		return {
			id: createShapeId(),
			type: 'text',
			x,
			y,
			props: {
				w: width,
				autoSize: false,
				color: 'white',
				size: 'm',
				richText: toRichText(text),
			},
		} as any
	}

	function createNoteShape(text: string, x: number, y: number, color = 'yellow') {
		return {
			id: createShapeId(),
			type: 'note',
			x,
			y,
			props: {
				color,
				size: 'm',
				richText: toRichText(text),
			},
		} as any
	}

	function createBoxShape(
		text: string,
		x: number,
		y: number,
		w: number,
		h: number,
		color = 'light-blue'
	) {
		return {
			id: createShapeId(),
			type: 'geo',
			x,
			y,
			props: {
				w,
				h,
				geo: 'rectangle',
				color,
				fill: 'none',
				dash: 'draw',
				size: 'm',
				richText: toRichText(text),
			},
		} as any
	}

	function createEllipseShape(
		text: string,
		x: number,
		y: number,
		w: number,
		h: number,
		color = 'violet'
	) {
		return {
			id: createShapeId(),
			type: 'geo',
			x,
			y,
			props: {
				w,
				h,
				geo: 'ellipse',
				color,
				fill: 'none',
				dash: 'draw',
				size: 'm',
				richText: toRichText(text),
			},
		} as any
	}

	function createArrowShape(x: number, y: number, endX: number, endY: number) {
		return {
			id: createShapeId(),
			type: 'arrow',
			x,
			y,
			props: {
				start: { x: 0, y: 0 },
				end: { x: endX, y: endY },
				bend: 0,
				arrowheadStart: 'none',
				arrowheadEnd: 'arrow',
				color: 'light-blue',
				size: 'm',
			},
		} as any
	}

	function insertTemplate(template: TemplateType) {
		if (!editor || isViewOnly) return

		const center = getCenterPoint()
		const x = center.x - 420
		const y = center.y - 260

		let shapes: any[] = []

		if (template === 'brainstorm') {
			shapes = [
				createTextShape('Brainstorming Board', x + 260, y, 360),
				createNoteShape('Idea 1', x, y + 90, 'yellow'),
				createNoteShape('Idea 2', x + 240, y + 90, 'green'),
				createNoteShape('Idea 3', x + 480, y + 90, 'blue'),
				createNoteShape('Problems', x, y + 330, 'red'),
				createNoteShape('Solutions', x + 240, y + 330, 'violet'),
				createNoteShape('Next Steps', x + 480, y + 330, 'orange'),
			]
		}

		if (template === 'wireframe') {
			shapes = [
				createTextShape('Website Wireframe', x + 270, y, 360),
				createBoxShape('Header / Navbar', x + 120, y + 80, 620, 70, 'light-blue'),
				createBoxShape('Hero Section', x + 120, y + 170, 620, 160, 'violet'),
				createBoxShape('Feature Card', x + 120, y + 360, 180, 120, 'green'),
				createBoxShape('Feature Card', x + 340, y + 360, 180, 120, 'green'),
				createBoxShape('Feature Card', x + 560, y + 360, 180, 120, 'green'),
				createBoxShape('Footer', x + 120, y + 520, 620, 70, 'orange'),
			]
		}

		if (template === 'retro') {
			shapes = [
				createTextShape('Retrospective Board', x + 270, y, 360),
				createBoxShape('Went Well', x, y + 90, 240, 420, 'green'),
				createBoxShape('Needs Improvement', x + 300, y + 90, 240, 420, 'orange'),
				createBoxShape('Action Items', x + 600, y + 90, 240, 420, 'red'),
				createNoteShape('Add points here', x + 20, y + 180, 'green'),
				createNoteShape('Add issues here', x + 320, y + 180, 'orange'),
				createNoteShape('Add tasks here', x + 620, y + 180, 'red'),
			]
		}

		if (template === 'mindmap') {
			shapes = [
				createEllipseShape('Main Topic', x + 330, y + 230, 220, 110, 'light-blue'),
				createBoxShape('Branch 1', x + 40, y + 70, 180, 90, 'green'),
				createBoxShape('Branch 2', x + 650, y + 70, 180, 90, 'violet'),
				createBoxShape('Branch 3', x + 40, y + 430, 180, 90, 'orange'),
				createBoxShape('Branch 4', x + 650, y + 430, 180, 90, 'red'),
				createArrowShape(x + 330, y + 250, -130, -120),
				createArrowShape(x + 550, y + 250, 130, -120),
				createArrowShape(x + 330, y + 300, -130, 150),
				createArrowShape(x + 550, y + 300, 130, 150),
			]
		}

		if (shapes.length === 0) return

		const ids = shapes.map((shape) => shape.id)

		editor.run(() => {
			editor.createShapes(shapes)
			editor.select(...ids)
			editor.setCurrentTool('select')
		})

		setIsMenuOpen(false)
	}

	function addCommentToSelectedElement() {
		if (!editor || isViewOnly) return

		const selectedIds = editor.getSelectedShapeIds()

		if (selectedIds.length === 0) {
			alert('Select an element first, then click Comment.')
			return
		}

		const message = window.prompt('Write a comment for the selected element:')

		if (!message || !message.trim()) return

		const targetId = selectedIds[0]
		const bounds = editor.getShapePageBounds(targetId)

		if (!bounds) {
			alert('Could not attach comment to this element.')
			return
		}

		const commentX = bounds.x + bounds.w + 80
		const commentY = bounds.y
		const arrowStartX = bounds.x + bounds.w
		const arrowStartY = bounds.y + bounds.h / 2
		const arrowEndX = commentX - arrowStartX
		const arrowEndY = commentY + 80 - arrowStartY

		const commentNote = createNoteShape(`Comment:\n${message.trim()}`, commentX, commentY, 'blue')
		const arrow = createArrowShape(arrowStartX, arrowStartY, arrowEndX, arrowEndY)

		editor.run(() => {
			editor.createShapes([arrow, commentNote])
			editor.select(commentNote.id)
			editor.setCurrentTool('select')
		})

		setIsMenuOpen(false)
	}

	function handleTemplateChange(event: ChangeEvent<HTMLSelectElement>) {
		const value = event.target.value as TemplateType

		if (!value) return

		insertTemplate(value)
		event.target.value = ''
	}

	function getBackgroundStyle(mode: BackgroundMode): CSSProperties {
		const base: CSSProperties = {
			position: 'absolute',
			inset: 0,
			zIndex: 2,
			pointerEvents: 'none',
			opacity: 0.22,
		}

		if (mode === 'plain') {
			return {
				...base,
				background: 'transparent',
			}
		}

		if (mode === 'grid') {
			return {
				...base,
				backgroundImage:
					'linear-gradient(rgba(34,211,238,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.45) 1px, transparent 1px)',
				backgroundSize: '42px 42px',
			}
		}

		if (mode === 'dots') {
			return {
				...base,
				backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.55) 1px, transparent 1px)',
				backgroundSize: '28px 28px',
			}
		}

		return {
			...base,
			backgroundImage: 'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px)',
			backgroundSize: '100% 32px',
		}
	}

	return (
		<div style={styles.page}>
			<div style={styles.compactHud}>
				<div style={styles.logo}>D</div>

				<div style={styles.compactText}>
					<div style={styles.title}>DevBoard</div>
					<div style={styles.roomId}>Room: {roomId}</div>
				</div>

				<div style={styles.status}>
					<span style={styles.statusDot} />
					Live
				</div>

				<div style={isViewOnly ? styles.viewBadge : styles.editBadge}>
					{isViewOnly ? 'View' : 'Edit'}
				</div>

				<button style={styles.menuButton} onClick={() => setIsMenuOpen((value) => !value)}>
					{isMenuOpen ? 'Close' : 'Menu'}
				</button>

				{copiedMessage && <div style={styles.copied}>{copiedMessage}</div>}
			</div>

			{isMenuOpen && (
				<div style={styles.controlPanel}>
					<div style={styles.panelHeader}>
						<div>
							<div style={styles.panelTitle}>DevBoard Controls</div>
							<div style={styles.panelSubtitle}>Tools stay hidden until needed.</div>
						</div>

						<button style={styles.smallButton} onClick={() => setIsMenuOpen(false)}>
							×
						</button>
					</div>

					<div style={styles.panelSection}>
						<label style={styles.label}>Templates</label>
						<select
							style={styles.select}
							defaultValue=""
							onChange={handleTemplateChange}
							disabled={isViewOnly}
							title="Insert template board"
						>
							<option value="" disabled>
								Choose template
							</option>
							<option value="brainstorm">Brainstorming</option>
							<option value="wireframe">Wireframe</option>
							<option value="retro">Retro</option>
							<option value="mindmap">Mindmap</option>
						</select>
					</div>

					<div style={styles.panelSection}>
						<label style={styles.label}>Background</label>
						<select
							style={styles.select}
							value={background}
							onChange={(event) => setBackground(event.target.value as BackgroundMode)}
							title="Change canvas background"
						>
							<option value="plain">Plain</option>
							<option value="grid">Grid</option>
							<option value="dots">Dots</option>
							<option value="lined">Lined</option>
						</select>
					</div>

					<div style={styles.buttonGrid}>
						<button style={styles.button} onClick={addCommentToSelectedElement} disabled={isViewOnly}>
							Comment
						</button>

						<button style={styles.button} onClick={() => navigate('/')}>
							Home
						</button>

						<button style={styles.button} onClick={createNewBoard}>
							New board
						</button>

						<button style={styles.primaryButton} onClick={copyEditLink}>
							Edit link
						</button>

						<button style={styles.button} onClick={copyViewLink}>
							View link
						</button>
					</div>
				</div>
			)}

			<div style={styles.content}>{children}</div>
			<div style={getBackgroundStyle(background)} />
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
		zIndex: 1,
	},

	compactHud: {
		position: 'fixed',
		top: 10,
		left: '50%',
		transform: 'translateX(-50%)',
		zIndex: 9999,
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: 8,
		border: '1px solid rgba(139, 148, 158, 0.28)',
		borderRadius: 18,
		background: 'rgba(13, 17, 23, 0.94)',
		backdropFilter: 'blur(16px)',
		boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
		maxWidth: 'calc(100vw - 420px)',
		minWidth: 360,
		overflow: 'visible',
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

	compactText: {
		minWidth: 0,
		maxWidth: 180,
		marginRight: 4,
	},

	title: {
		fontSize: 15,
		fontWeight: 900,
		lineHeight: 1,
		color: '#f0f6fc',
	},

	roomId: {
		marginTop: 5,
		maxWidth: 170,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		fontSize: 12,
		fontWeight: 600,
		color: '#8b949e',
	},

	status: {
		display: 'flex',
		alignItems: 'center',
		gap: 7,
		height: 34,
		padding: '0 11px',
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
		height: 34,
		display: 'flex',
		alignItems: 'center',
		padding: '0 11px',
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
		height: 34,
		display: 'flex',
		alignItems: 'center',
		padding: '0 11px',
		border: '1px solid rgba(210, 153, 34, 0.42)',
		borderRadius: 10,
		background: 'rgba(210, 153, 34, 0.14)',
		color: '#f2cc60',
		fontSize: 13,
		fontWeight: 800,
		whiteSpace: 'nowrap',
		flexShrink: 0,
	},

	menuButton: {
		height: 34,
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

	controlPanel: {
		position: 'fixed',
		top: 72,
		left: '50%',
		transform: 'translateX(-50%)',
		zIndex: 9999,
		width: 390,
		maxWidth: 'calc(100vw - 24px)',
		padding: 14,
		border: '1px solid rgba(139, 148, 158, 0.28)',
		borderRadius: 18,
		background: 'rgba(13, 17, 23, 0.96)',
		backdropFilter: 'blur(18px)',
		boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
	},

	panelHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		marginBottom: 12,
	},

	panelTitle: {
		fontSize: 15,
		fontWeight: 900,
		color: '#f0f6fc',
	},

	panelSubtitle: {
		marginTop: 3,
		fontSize: 12,
		fontWeight: 600,
		color: '#8b949e',
	},

	panelSection: {
		display: 'grid',
		gap: 7,
		marginBottom: 10,
	},

	label: {
		fontSize: 12,
		fontWeight: 800,
		color: '#8b949e',
		textTransform: 'uppercase',
		letterSpacing: 0.7,
	},

	select: {
		width: '100%',
		height: 38,
		padding: '0 12px',
		border: '1px solid rgba(139, 148, 158, 0.32)',
		borderRadius: 10,
		background: '#21262d',
		color: '#e6edf3',
		fontSize: 13,
		fontWeight: 800,
		cursor: 'pointer',
		outline: 'none',
	},

	buttonGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 8,
		marginTop: 12,
	},

	button: {
		height: 38,
		padding: '0 13px',
		border: '1px solid rgba(139, 148, 158, 0.32)',
		borderRadius: 10,
		background: '#21262d',
		color: '#e6edf3',
		fontSize: 13,
		fontWeight: 800,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
	},

	smallButton: {
		width: 34,
		height: 34,
		border: '1px solid rgba(139, 148, 158, 0.32)',
		borderRadius: 10,
		background: '#21262d',
		color: '#e6edf3',
		fontSize: 20,
		fontWeight: 900,
		cursor: 'pointer',
		lineHeight: 1,
	},

	primaryButton: {
		height: 38,
		padding: '0 13px',
		border: '1px solid rgba(88, 166, 255, 0.65)',
		borderRadius: 10,
		background: '#1f6feb',
		color: '#ffffff',
		fontSize: 13,
		fontWeight: 900,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
	},

	copied: {
		position: 'absolute',
		top: 52,
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