const InputGroup = ({
    type, placeholder, name, onChange, label, value, ...props
}) => {
    return (
        <div className="input-group mb-3">
            <span className="input-group-text">{label}</span>
            <input className="form-control"
                type={type}
                placeholder={placeholder}
                name={name}
                onChange={onChange}
                value={value}
                {...props}
            />
        </div>
    )
}

export default InputGroup;
