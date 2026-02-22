import { User, Mail, Phone, MapPin, BriefcaseBusiness, Linkedin, Globe } from "lucide-react"

const PersonalInfoForm = ({ data = {}, onChange, removeBackground, setRemoveBackground }) => {

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }


    const fields = [
        {
            key: "full_name", label: "Full Name", icon: User, type: "text",
            required: true
        },
        {
            key: "email", label: "Email Address", icon: Mail, type: "email",
            required: true
        },
        { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
        { key: "location", label: "Location", icon: MapPin, type: "text" },
        { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
        { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
        { key: "website", label: "Website", icon: Globe, type: "url" }
    ]

    return (
        <div>
            <h3 className='text-lg font-semibold text-gray-900'>Personal Information</h3>
            <p className='text-sm text-gray-600'>Get Started with the persoanl
                information</p>
            <div className='flex items-center gap-2'>
                <label>
                    {data.image ? (
                        <img src={typeof data.image === "string" ? data.image : URL.
                            createObjectURL(data.image)} alt="user-image" className='w-16 h-16 
                        rounded-full object-cover mt-5 ring ring-slate-300
                        hover:opacity-80' />
                    ) : (
                        <div className='inline-flex items-center gap-2 mt-5 text-slate-600
                    hover:text-slate-700 cursor-pointer'>
                            <User className='size-10 p-2.5 border rounded-full' />
                            Upload user image
                        </div>
                    )}
                    <input type="file" accept='image/jpeg,image/png' className='hidden'
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                handleChange("image", file);
                                setRemoveBackground(false); // Reset toggle when new file selected
                            }
                        }} />
                </label>
                {data.image && (
                    <div className='flex flex-col gap-1 pl-4 text-sm'>
                        <p className={`transition-colors ${data.image instanceof File ? 'text-gray-900' : 'text-gray-400'}`}>
                            Remove Background
                        </p>
                        <label className={`relative inline-flex items-center gap-3 ${!(data.image instanceof File) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                className='sr-only peer'
                                onChange={() => setRemoveBackground(prev => !prev)}
                                checked={removeBackground}
                                disabled={!(data.image instanceof File)}
                            />
                            <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${removeBackground ? 'bg-green-600' : 'bg-slate-300'}`}>
                                <span className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out ${removeBackground ? 'translate-x-4' : 'translate-x-0'}`}></span>
                            </div>
                        </label>
                        {!(data.image instanceof File) && (
                            <p className='text-xs text-gray-400'>Upload new image to change</p>
                        )}
                    </div>
                )}
            </div>

            {fields.map((field) => {
                const Icon = field.icon
                return (
                    <div key={field.key} className='space-y-1 mt-5'>
                        <label className='flex items-center gap-2 text-sm font-medium
                    text-gray-600'>
                            <Icon className='size-4' />
                            {field.label}
                            {field.required && (<span className='text-red-500'>*</span>)}
                        </label>
                        <input type={field.type} value={data[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg
                   focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none
                   transition-colors text-sm' placeholder={`Enter your ${field.label.toLowerCase()}`} required={field.required}
                        />
                    </div>
                )
            })}





        </div>
    )
}

export default PersonalInfoForm