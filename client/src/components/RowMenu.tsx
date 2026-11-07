import { Ellipsis } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface MenuItem {
  label: string
  onSelect: () => void
  disabled?: boolean
}

export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const target = e.target
      if (
        target instanceof Node &&
        !ref.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger || !menu) return
      const triggerRect = trigger.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()
      const margin = 8
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const top =
        menuRect.height > spaceBelow - margin && spaceAbove > spaceBelow
          ? triggerRect.top - menuRect.height
          : triggerRect.bottom
      setPosition({
        left: Math.max(
          margin,
          Math.min(
            triggerRect.right - menuRect.width,
            window.innerWidth - menuRect.width - margin,
          ),
        ),
        top: Math.max(
          margin,
          Math.min(top, window.innerHeight - menuRect.height - margin),
        ),
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    document.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  if (items.length === 0) return null
  return (
    <div className="row-menu" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="icon-btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="menu row-menu-popup"
            role="menu"
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            {items.map((item) => (
              <li key={item.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
