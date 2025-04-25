import React, { useState } from 'react'
import { assets } from '../assets/assets'

// Input Field Component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address?.[name]}
        required
    />
)

const AddAddress = () => {

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setAddress(() => ({
            ...prevAddress,
            [name]: value
        }))
    }


    const onSubmitHandler = async (e) => {
        e.preventDefault()
    }

    return (
        <div className='mt-15 pb-16'>
            <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-primary'>Address</span></p>
            <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
                <div className='flex-1 max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>

                        <div className='grid grid-cols-2 gap-2'>
                            <InputField handleChange={handleChange} address={address} type='text' placeholder='First Name' name='firstName' />
                            <InputField handleChange={handleChange} address={address} type='text' placeholder='Last Name' name='lastName' />
                        </div>

                        <InputField handleChange={handleChange} address={address} type='email' placeholder='Email Address' name='email' />
                        <InputField handleChange={handleChange} address={address} type='text' placeholder='Street Address' name='street' />

                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} type='text' placeholder='City' name='city' />
                            <InputField handleChange={handleChange} address={address} type='text' placeholder='State' name='state' />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} type='number' placeholder='Zip Code' name='zipcode' />
                            <InputField handleChange={handleChange} address={address} type='text' placeholder='Country' name='Country' />
                        </div>

                        <InputField handleChange={handleChange} address={address} type='text' placeholder='Phone Number' name='phone' />

                        <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'>
                            Save Address
                        </button>


                    </form>
                </div>
                <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt='add address' />
            </div>
        </div>
    )
}

export default AddAddress
