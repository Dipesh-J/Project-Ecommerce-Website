import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '../components';
import { useAuthStore } from '../store';

/**
 * Register page component
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear store error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fname.trim()) {
      newErrors.fname = 'First name is required';
    } else if (!/^[a-zA-Z ,.'-]+$/.test(formData.fname)) {
      newErrors.fname = 'First name is not valid';
    }

    if (!formData.lname.trim()) {
      newErrors.lname = 'Last name is required';
    } else if (!/^[a-zA-Z ,.'-]+$/.test(formData.lname)) {
      newErrors.lname = 'Last name is not valid';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0]?[6789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(formData.password)) {
      newErrors.password = 'Password must be 8-15 characters with uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z ,.'-]+$/.test(formData.city)) {
      newErrors.city = 'City name is not valid';
    }

    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!profileImage) {
      newErrors.profileImage = 'Profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(file.name)) {
        setErrors((prev) => ({ ...prev, profileImage: 'Please select a valid image file' }));
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profileImage: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Create FormData for multipart/form-data
    const submitData = new FormData();
    submitData.append('fname', formData.fname);
    submitData.append('lname', formData.lname);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('password', formData.password);
    submitData.append('profileImage', profileImage);

    // Address as JSON string (as expected by backend)
    const address = {
      shipping: {
        street: formData.street,
        city: formData.city,
        pincode: Number(formData.pincode),
      },
      billing: {
        street: formData.street,
        city: formData.city,
        pincode: Number(formData.pincode),
      },
    };
    submitData.append('address', JSON.stringify(address));

    const result = await register(submitData);

    if (result.success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card variant="elevated" padding="lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
              Create Account
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Join us and start shopping today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-[var(--radius-md)] text-[var(--color-error)] text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-bg-default)] border-2 border-[var(--color-primary)]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 p-2 bg-[var(--color-primary)] rounded-full cursor-pointer hover:bg-[var(--color-primary-variant)] transition-colors"
                >
                  <span className="text-white text-sm">📷</span>
                </label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {errors.profileImage && (
                <p className="text-sm text-[var(--color-error)]">{errors.profileImage}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                placeholder="John"
                error={errors.fname}
                required
              />
              <Input
                label="Last Name"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lname}
                required
              />
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                error={errors.phone}
                required
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                error={errors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t border-[var(--color-bg-default)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
                Address
              </h3>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  error={errors.street}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    error={errors.city}
                    required
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    error={errors.pincode}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 rounded border-[var(--color-bg-surface)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                required
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-text-secondary)]">
                I agree to the{' '}
                <Link to="/terms" className="text-[var(--color-primary-variant)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[var(--color-primary-variant)] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-primary-variant)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
