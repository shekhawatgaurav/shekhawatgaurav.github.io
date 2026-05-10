function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  name,
  required = false,
  disabled = false,
  helperText = "",
  error = "",
  min,
  max,
  step,
}) {
  return (
    <div className="form-row">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className={error ? "input-error" : ""}
      />

      {helperText && !error && <small>{helperText}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

export default Input;