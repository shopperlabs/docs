export const ComponentPreview = ({ children, className = '', centered = true }) => {
  return (
    <div className={`sh-preview ${className}`}>
      <div className={`sh-preview-content ${centered ? 'flex items-center justify-center' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export const PreviewCard = ({ title, description, children, className = '' }) => {
  return (
    <div className={`sh-card-outer ${className}`}>
      {title && (
        <div className="sh-card-header">
          <span className="sh-card-title">{title}</span>
          {description && <span className="sh-card-description">{description}</span>}
        </div>
      )}
      <div className="sh-card-inner">
        {children}
      </div>
    </div>
  )
}

export const PreviewAlert = ({ message, color = 'warning', title = null, icon = null }) => {
  const iconColors = {
    info: '#3b82f6',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  }
  const titleColors = {
    info: '#2563eb',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
  }

  return (
    <div className={`sh-alert sh-alert-${color}`}>
      <div style={{ display: 'flex', gap: 12 }}>
        {icon !== false && (
          <div style={{ flexShrink: 0 }}>
            <svg width="20" height="20" fill={iconColors[color]} viewBox="0 0 20 20">
              {color === 'info' && <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />}
              {color === 'danger' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
              {color === 'success' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />}
              {color === 'warning' && <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
            </svg>
          </div>
        )}
        <div>
          {title && (
            <span style={{ display: 'block', fontSize: 14, lineHeight: '20px', fontWeight: 500, color: titleColors[color] }}>
              {title}
            </span>
          )}
          <span style={{ display: 'block', fontSize: 14, lineHeight: '20px', marginTop: title ? 8 : 0, color: iconColors[color] }}>
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}

export const PreviewHeading = ({ title, children }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span className="sh-heading">{title}</span>
      {children && <div>{children}</div>}
    </div>
  )
}

export const PreviewSectionHeading = ({ title, description }) => {
  return (
    <div>
      <span className="sh-section-title">{title}</span>
      {description && <span className="sh-section-description">{description}</span>}
    </div>
  )
}

export const PreviewEmptyState = ({ title, content, buttonText, imageSrc }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '32px 0', gap: 32 }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {imageSrc ? (
          <img src={imageSrc} alt="" style={{ height: 'auto', maxWidth: 200 }} />
        ) : (
          <div className="sh-empty-icon-bg">
            <svg className="sh-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <span className="sh-empty-title">{title}</span>
        <span className="sh-empty-content">{content}</span>
        {buttonText && (
          <button className="sh-btn sh-btn-primary" style={{ marginTop: 20 }}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

export const PreviewButton = ({ children, variant = 'primary', size = 'md' }) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 14 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 16 },
  }
  return (
    <button className={`sh-btn sh-btn-${variant}`} style={sizeStyles[size]}>
      {children}
    </button>
  )
}

export const PreviewEmptyCard = ({ heading, description, icon = true, action }) => {
  return (
    <div className="sh-empty-card">
      {icon && (
        <div className="sh-empty-card-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
      <span className="sh-empty-card-heading" style={{ marginTop: icon ? 8 : 0 }}>{heading}</span>
      {description && <span className="sh-empty-card-description">{description}</span>}
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  )
}

export const PreviewStockBadge = ({ stock }) => {
  const isLow = stock < 10
  return (
    <span className={`sh-stock-badge ${isLow ? 'sh-stock-badge-low' : 'sh-stock-badge-ok'}`}>
      {stock}
    </span>
  )
}

export const PreviewLoader = ({ size = 'md' }) => {
  const sizes = { sm: 16, md: 20, lg: 24 }
  return (
    <svg className="sh-loader" style={{ width: sizes[size], height: sizes[size] }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export const PreviewLabel = ({ value, isRequired = false }) => {
  return (
    <span className="sh-label">
      {value}
      {isRequired && <span className="sh-label-required"> *</span>}
    </span>
  )
}

export const PreviewUserAvatar = ({ name, showName = true, src = 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff' }) => {
  return (
    <div className="sh-user-avatar">
      <img className="sh-user-avatar-img" src={src} alt={name} />
      {showName && <span className="sh-user-avatar-name">{name}</span>}
    </div>
  )
}
