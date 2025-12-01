import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiEdit2, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Loader, Input } from '../components';
import { useAuthStore } from '../store';

/**
 * User profile page
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, fetchProfile, updateProfile, isLoading } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  // Initialize form from user data
  const initialFormData = useMemo(() => ({
    fname: user?.fname || '',
    lname: user?.lname || '',
    phone: user?.phone || '',
    street: user?.address?.shipping?.street || '',
    city: user?.address?.shipping?.city || '',
    pincode: user?.address?.shipping?.pincode?.toString() || '',
  }), [user]);
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate, fetchProfile]);

  // Sync form data when user changes (e.g., after fetch)
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.fname && !/^[a-zA-Z ,.'-]+$/.test(formData.fname)) {
      newErrors.fname = 'First name is not valid';
    }

    if (formData.lname && !/^[a-zA-Z ,.'-]+$/.test(formData.lname)) {
      newErrors.lname = 'Last name is not valid';
    }

    if (formData.phone && !/^[0]?[6789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }

    if (formData.city && !/^[a-zA-Z ,.'-]+$/.test(formData.city)) {
      newErrors.city = 'City name is not valid';
    }

    if (formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
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
      if (!/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(file.name)) {
        toast.error('Please select a valid image file');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const submitData = new FormData();

    // Only append changed fields
    if (formData.fname !== user.fname) submitData.append('fname', formData.fname);
    if (formData.lname !== user.lname) submitData.append('lname', formData.lname);
    if (formData.phone !== user.phone) submitData.append('phone', formData.phone);

    // Address
    const hasAddressChange =
      formData.street !== user.address?.shipping?.street ||
      formData.city !== user.address?.shipping?.city ||
      formData.pincode !== user.address?.shipping?.pincode?.toString();

    if (hasAddressChange) {
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
    }

    if (profileImage) {
      submitData.append('profileImage', profileImage);
    }

    // Check if any data to update
    let hasData = false;
    for (const _ of submitData.entries()) {
      hasData = true;
      break;
    }

    if (!hasData) {
      toast.error('No changes to save');
      setIsEditing(false);
      return;
    }

    const result = await updateProfile(submitData);

    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setProfileImage(null);
      setPreviewUrl('');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setPreviewUrl('');
    // Reset form to user data
    if (user) {
      setFormData({
        fname: user.fname || '',
        lname: user.lname || '',
        phone: user.phone || '',
        street: user.address?.shipping?.street || '',
        city: user.address?.shipping?.city || '',
        pincode: user.address?.shipping?.pincode?.toString() || '',
      });
    }
    setErrors({});
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
              My Profile
            </h1>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <FiEdit2 className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Card */}
          <Card variant="elevated" padding="lg">
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--color-bg-default)] border-4 border-[var(--color-primary)]">
                    <img
                      src={previewUrl || user.profileImage || '/placeholder-avatar.jpg'}
                      alt={`${user.fname} ${user.lname}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-3 bg-[var(--color-primary)] rounded-full cursor-pointer hover:bg-[var(--color-primary-variant)] transition-colors">
                      <FiCamera className="text-white" size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4">
                  {user.fname} {user.lname}
                </h2>
                <p className="text-[var(--color-text-secondary)]">{user.email}</p>
              </div>

              {/* Profile Info */}
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4 flex items-center">
                    <FiUser className="mr-2" />
                    Personal Information
                  </h3>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="fname"
                        value={formData.fname}
                        onChange={handleChange}
                        error={errors.fname}
                      />
                      <Input
                        label="Last Name"
                        name="lname"
                        value={formData.lname}
                        onChange={handleChange}
                        error={errors.lname}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">First Name</p>
                        <p className="text-[var(--color-text-primary)]">{user.fname}</p>
                      </div>
                      <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Last Name</p>
                        <p className="text-[var(--color-text-primary)]">{user.lname}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4 flex items-center">
                    <FiPhone className="mr-2" />
                    Contact Information
                  </h3>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Email</p>
                        <p className="text-[var(--color-text-primary)]">{user.email}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                      <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Email</p>
                        <p className="text-[var(--color-text-primary)]">{user.email}</p>
                      </div>
                      <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Phone</p>
                        <p className="text-[var(--color-text-primary)]">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4 flex items-center">
                    <FiMapPin className="mr-2" />
                    Address
                  </h3>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Street Address"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        error={errors.street}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          error={errors.city}
                        />
                        <Input
                          label="Pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          error={errors.pincode}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                      <p className="text-[var(--color-text-primary)]">
                        {user.address?.shipping?.street}
                      </p>
                      <p className="text-[var(--color-text-secondary)]">
                        {user.address?.shipping?.city} - {user.address?.shipping?.pincode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" loading={isLoading} disabled={isLoading}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
