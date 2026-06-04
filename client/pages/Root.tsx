import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uniqueId } from 'tldraw'

interface Particle {
	x: number
	y: number
	vx: number
	vy: number
	size: number
	alpha: number
	color: string
}

export function Root() {
	const navigate = useNavigate()
	const [mounted, setMounted] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const mouseRef = useRef({ x: 0, y: 0 })
	const particlesRef = useRef<Particle[]>([])
	const rafRef = useRef<number>(0)

	function createNewBoard() {
		const boardId = 'board-' + uniqueId()
		navigate(`/${boardId}`)
	}

	function openDemoBoard() {
		navigate('/demo-board')
	}

	useEffect(() => {
		setMounted(true)

		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const resize = () => {
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}

		resize()
		window.addEventListener('resize', resize)

		const colors = ['#60a5fa', '#a78bfa', '#34d399', '#818cf8']

		particlesRef.current = Array.from({ length: 70 }, () => ({
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			vx: (Math.random() - 0.5) * 0.32,
			vy: (Math.random() - 0.5) * 0.32,
			size: Math.random() * 1.7 + 0.4,
			alpha: Math.random() * 0.45 + 0.12,
			color: colors[Math.floor(Math.random() * colors.length)],
		}))

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			const particles = particlesRef.current
			const { x: mx, y: my } = mouseRef.current

			for (const p of particles) {
				const dx = mx - p.x
				const dy = my - p.y
				const dist = Math.sqrt(dx * dx + dy * dy)

				if (dist > 0 && dist < 140) {
					p.vx -= (dx / dist) * 0.018
					p.vy -= (dy / dist) * 0.018
				}

				p.vx *= 0.995
				p.vy *= 0.995
				p.x += p.vx
				p.y += p.vy

				if (p.x < 0) p.x = canvas.width
				if (p.x > canvas.width) p.x = 0
				if (p.y < 0) p.y = canvas.height
				if (p.y > canvas.height) p.y = 0

				ctx.beginPath()
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
				ctx.fillStyle = p.color
				ctx.globalAlpha = p.alpha
				ctx.fill()
			}

			ctx.globalAlpha = 1

			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x
					const dy = particles[i].y - particles[j].y
					const d = Math.sqrt(dx * dx + dy * dy)

					if (d < 110) {
						ctx.beginPath()
						ctx.moveTo(particles[i].x, particles[i].y)
						ctx.lineTo(particles[j].x, particles[j].y)
						ctx.strokeStyle = `rgba(148,163,184,${(1 - d / 110) * 0.12})`
						ctx.lineWidth = 0.5
						ctx.stroke()
					}
				}
			}

			rafRef.current = requestAnimationFrame(draw)
		}

		draw()

		const onMouse = (e: MouseEvent) => {
			mouseRef.current = { x: e.clientX, y: e.clientY }
		}

		window.addEventListener('mousemove', onMouse)

		return () => {
			cancelAnimationFrame(rafRef.current)
			window.removeEventListener('resize', resize)
			window.removeEventListener('mousemove', onMouse)
		}
	}, [])

	return (
		<main className="DevBoardHomePremium">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Sora:wght@300;400;600;700;800&display=swap');

				* {
					box-sizing: border-box;
				}

				body {
					margin: 0;
					background: #020408;
				}

				@keyframes fadeUp {
					from { opacity: 0; transform: translateY(28px); }
					to { opacity: 1; transform: translateY(0); }
				}

				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}

				@keyframes floatGlow {
					0%, 100% { transform: translateY(0px) scale(1); opacity: 0.55; }
					50% { transform: translateY(-18px) scale(1.06); opacity: 0.75; }
				}

				@keyframes spinSlow {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}

				@keyframes shimmer {
					0% { background-position: -200% center; }
					100% { background-position: 200% center; }
				}

				@keyframes borderPulse {
					0%, 100% { opacity: 0.45; }
					50% { opacity: 0.95; }
				}

				.DevBoardHomePremium {
					position: relative;
					min-height: 100vh;
					overflow: hidden;
					background: #020408;
					color: white;
					font-family: 'DM Sans', 'Sora', sans-serif;
				}

				.HomeParticles {
					position: absolute;
					inset: 0;
					pointer-events: none;
					z-index: 1;
				}

				.HomeGlow {
					position: absolute;
					border-radius: 50%;
					z-index: 0;
					pointer-events: none;
					animation: floatGlow 10s ease-in-out infinite;
				}

				.HomeGlowOne {
					top: -20%;
					left: -15%;
					width: 55vw;
					height: 55vw;
					background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
				}

				.HomeGlowTwo {
					top: 5%;
					right: -10%;
					width: 48vw;
					height: 48vw;
					background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
					animation-delay: 2s;
				}

				.HomeGlowThree {
					bottom: -10%;
					left: 30%;
					width: 42vw;
					height: 42vw;
					background: radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%);
					animation-delay: 4s;
				}

				.HomeGrid {
					position: absolute;
					inset: 0;
					z-index: 0;
					background-image:
						linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
					background-size: 60px 60px;
					mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%);
				}

				.HomeOrbit {
					position: absolute;
					top: 50%;
					left: 50%;
					width: min(700px, 90vw);
					height: min(700px, 90vw);
					transform: translate(-50%, -50%);
					z-index: 0;
					pointer-events: none;
				}

				.HomeOrbitRing {
					position: absolute;
					border-radius: 50%;
					border: 1px solid rgba(99,102,241,0.12);
					animation: spinSlow linear infinite;
				}

				.HomeContent {
					position: relative;
					z-index: 10;
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 64px 24px;
				}

				.fade1 { animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
				.fade2 { animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.2) 0.3s both; }
				.fade3 { animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.2) 0.45s both; }
				.fade4 { animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.2) 0.6s both; }
				.fade5 { animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.2) 0.75s both; }
				.fade6 { animation: fadeIn 1s ease 0.9s both; }

				.HomeBadge {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 24px;
					padding: 7px 18px;
					border-radius: 999px;
					background: rgba(99,102,241,0.1);
					border: 1px solid rgba(99,102,241,0.3);
					color: rgba(255,255,255,0.72);
					font-size: 13px;
					font-weight: 700;
					letter-spacing: 0.06em;
					text-transform: uppercase;
					animation: borderPulse 3s ease-in-out infinite;
				}

				.HomeBadgeDot {
					width: 7px;
					height: 7px;
					border-radius: 50%;
					background: #34d399;
					box-shadow: 0 0 8px #34d399;
				}

				.HomeTitle {
					margin: 0 0 20px;
					text-align: center;
					font-family: 'Sora', sans-serif;
					font-size: clamp(3.2rem, 9vw, 7rem);
					line-height: 1.04;
					font-weight: 800;
					letter-spacing: -0.04em;
					background: linear-gradient(135deg, #fff 0%, #93c5fd 40%, #a78bfa 70%, #67e8f9 100%);
					background-size: 200%;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					animation: shimmer 5s linear infinite;
				}

				.HomeSubtitle {
					max-width: 620px;
					margin: 0 0 40px;
					text-align: center;
					font-size: clamp(1rem, 2.5vw, 1.2rem);
					line-height: 1.75;
					color: rgba(255,255,255,0.55);
					font-weight: 400;
				}

				.HomeActions {
					display: flex;
					justify-content: center;
					flex-wrap: wrap;
					gap: 14px;
					margin-bottom: 58px;
				}

				.HomeButton {
					position: relative;
					min-width: 200px;
					padding: 15px 36px;
					border-radius: 14px;
					font-size: 16px;
					cursor: pointer;
					overflow: hidden;
				}

				.HomeButtonPrimary {
					border: none;
					background: linear-gradient(135deg, #4f8ef7 0%, #818cf8 50%, #a78bfa 100%);
					color: #fff;
					font-weight: 700;
					letter-spacing: 0.01em;
					box-shadow: 0 0 28px rgba(99,102,241,0.45), 0 4px 24px rgba(0,0,0,0.5);
					transition: transform 0.18s ease, box-shadow 0.18s ease;
				}

				.HomeButtonPrimary:hover {
					transform: translateY(-2px) scale(1.02);
					box-shadow: 0 0 48px rgba(99,102,241,0.65), 0 8px 32px rgba(0,0,0,0.6);
				}

				.HomeButtonSecondary {
					background: rgba(255,255,255,0.04);
					border: 1px solid rgba(255,255,255,0.14);
					color: rgba(255,255,255,0.82);
					font-weight: 600;
					backdrop-filter: blur(12px);
					transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
				}

				.HomeButtonSecondary:hover {
					transform: translateY(-2px) scale(1.02);
					background: rgba(255,255,255,0.08);
					border-color: rgba(255,255,255,0.28);
				}

				.HomeStats {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 38px;
					margin-bottom: 58px;
					max-width: 700px;
				}

				.HomeStat {
					text-align: center;
				}

				.HomeStatNumber {
					font-family: 'Sora', sans-serif;
					font-size: clamp(1.6rem, 4vw, 2.2rem);
					font-weight: 800;
					letter-spacing: -0.03em;
					background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.HomeStatLabel {
					margin-top: 2px;
					font-size: 13px;
					color: rgba(255,255,255,0.38);
					font-weight: 500;
					letter-spacing: 0.04em;
				}

				.HomeCards {
					width: 100%;
					max-width: 880px;
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
					gap: 14px;
				}

				.HomeCard {
					padding: 20px 22px;
					border-radius: 18px;
					background: rgba(255,255,255,0.038);
					border: 1px solid rgba(255,255,255,0.09);
					backdrop-filter: blur(24px) saturate(140%);
					transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
				}

				.HomeCard:hover {
					transform: translateY(-4px);
					border-color: rgba(255,255,255,0.18);
					background: rgba(255,255,255,0.055);
				}

				.HomeIcon {
					width: 40px;
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 14px;
					border-radius: 12px;
					background: rgba(99,102,241,0.12);
					font-size: 20px;
				}

				.HomeCardTitle {
					margin-bottom: 6px;
					font-size: 15px;
					font-weight: 700;
					color: rgba(255,255,255,0.92);
				}

				.HomeCardDesc {
					font-size: 13.5px;
					color: rgba(255,255,255,0.42);
					line-height: 1.65;
				}

				.HomeHint {
					margin-top: 38px;
					text-align: center;
					font-size: 13px;
					color: rgba(255,255,255,0.3);
				}

				.HomeUrlChip {
					display: inline-block;
					padding: 2px 10px;
					border-radius: 8px;
					background: rgba(99,102,241,0.12);
					border: 1px solid rgba(99,102,241,0.28);
					color: #a78bfa;
					font-size: 13px;
				}
			`}</style>

			<canvas ref={canvasRef} className="HomeParticles" />

			<div className="HomeGlow HomeGlowOne" />
			<div className="HomeGlow HomeGlowTwo" />
			<div className="HomeGlow HomeGlowThree" />

			<div className="HomeGrid" />

			<div className="HomeOrbit">
				<div className="HomeOrbitRing" style={{ inset: 0, animationDuration: '32s', opacity: 0.4 }} />
				<div
					className="HomeOrbitRing"
					style={{
						inset: '8%',
						animationDuration: '24s',
						animationDirection: 'reverse',
						opacity: 0.25,
					}}
				/>
			</div>

			<div className="HomeContent">
				<div className="fade1" style={{ animation: mounted ? undefined : 'none' }}>
					<div className="HomeBadge">
						<span className="HomeBadgeDot" />
						Real-time Collaborative Whiteboard
					</div>
				</div>

				<h1 className="HomeTitle fade2">DevBoard</h1>

				<p className="HomeSubtitle fade3">
					Create infinite whiteboards, draw ideas, add shapes and sticky notes, and
					collaborate with your team in real time through a shareable board link.
				</p>

				<div className="HomeActions fade4">
					<button className="HomeButton HomeButtonPrimary" onClick={createNewBoard}>
						Create New Board →
					</button>

					<button className="HomeButton HomeButtonSecondary" onClick={openDemoBoard}>
						Open Demo Board
					</button>
				</div>

				<div className="HomeStats fade5">
					<div className="HomeStat">
						<div className="HomeStatNumber">∞</div>
						<div className="HomeStatLabel">Canvas size</div>
					</div>

					<div className="HomeStat">
						<div className="HomeStatNumber">Live</div>
						<div className="HomeStatLabel">Sync engine</div>
					</div>

					<div className="HomeStat">
						<div className="HomeStatNumber">URL</div>
						<div className="HomeStatLabel">Share boards</div>
					</div>
				</div>

				<div className="HomeCards fade6">
					{[
						{
							icon: '✏️',
							title: 'Freehand Drawing',
							desc: 'Draw naturally with smooth pen strokes and shape tools.',
						},
						{
							icon: '🔗',
							title: 'Instant Share',
							desc: 'Every board has a unique URL that collaborators can open.',
						},
						{
							icon: '⚡',
							title: 'Real-time Sync',
							desc: 'Changes and collaborator cursors appear live across the room.',
						},
						{
							icon: '🗂️',
							title: 'Infinite Canvas',
							desc: 'Pan, zoom, and organize ideas without fixed page limits.',
						},
					].map(({ icon, title, desc }) => (
						<div key={title} className="HomeCard">
							<div className="HomeIcon">{icon}</div>
							<div className="HomeCardTitle">{title}</div>
							<div className="HomeCardDesc">{desc}</div>
						</div>
					))}
				</div>

				<p className="HomeHint fade6">
					Boards live at <span className="HomeUrlChip">/your-unique-board-id</span> — share the link to collaborate
				</p>
			</div>
		</main>
	)
}