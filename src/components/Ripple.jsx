import styles from '../assets/scss/customize.module.scss'

export default function Ripple({ tag, color, children, ...inline }) {
  const TagName = tag ? tag : 'div'

  function rippleElement(event) {
    const element = event?.currentTarget || event?.target
    const rect = element?.getBoundingClientRect()
    const size = Math.max(rect?.width, rect?.height)
    const radius = size / 2

    let ripple = document.createElement('span')
    ripple.className = styles?.ripple

    if (color) ripple.style.backgroundColor = color

    const pointX = event.touches ? event?.touches[0]?.clientX : event?.clientX
    const pointY = event.touches ? event?.touches[0]?.clientY : event?.clientY

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${pointX - rect?.x - radius}px`
    ripple.style.top = `${pointY - rect?.y - radius}px`

    setTimeout(() => ripple?.remove(), 1100)

    element?.append(ripple)
  }

  return (
    <TagName data-ripple {...inline} onMouseDown={rippleElement}>
      {children}
    </TagName>
  )
}