interface IconProps {
  src: string
  alt?: string
  className?: string
  size?: number
}

export function Icon({ src, alt = '', className = '', size = 26 }: IconProps) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        mask: `url(${src}) no-repeat center`,
        maskSize: 'contain',
        WebkitMask: `url(${src}) no-repeat center`,
        WebkitMaskSize: 'contain',
      }}
      role={alt ? 'img' : undefined}
      aria-hidden={!alt}
      aria-label={alt || undefined}
    />
  )
}
