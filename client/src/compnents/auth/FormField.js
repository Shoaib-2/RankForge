import React from 'react';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  icon, 
  helpText,
  error,
  ...props 
}) => {
  return (
    <div>
      <label 
        htmlFor={name}
        className="block text-sm font-medium mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 ${
            error ? 'border-red-400' : 'border-cyan-300'
          }`}
          style={{
            borderColor: error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 217, 255, 0.3)',
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--electric-cyan)';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.2)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
              e.target.style.boxShadow = 'none';
            }
          }}
          placeholder={placeholder}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className={error ? "text-red-400" : "text-cyan-400"}>{icon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
