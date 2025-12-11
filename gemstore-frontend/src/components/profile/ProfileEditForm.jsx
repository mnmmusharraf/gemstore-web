import React, { useState } from 'react';

const ProfileEditForm = ({ profile, saving, onSave, onCancel }) => {
  // Initialize directly from profile prop
  const [formData, setFormData] = useState(() => ({
    displayName: profile?. displayName || '',
    username: profile?.username || '',
    email: profile?. email || '',
    website: profile?.website || '',
    bio: profile?.bio || '',
    privateProfile: profile?.privateProfile || false,
  }));

  // No useEffect needed! 

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleCancel = () => {
    // Reset to original profile values
    setFormData({
      displayName: profile?.displayName || '',
      username: profile?.username || '',
      email: profile?. email || '',
      website: profile?.website || '',
      bio: profile?.bio || '',
      privateProfile: profile?.privateProfile || false,
    });
    onCancel();
  };

  return (
    <div className="profile-form-card">
      <h2 className="profile-form-title">Edit profile</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        <FormRow label="Name">
          <input
            className="profile-input"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Your name"
            maxLength={150}
          />
          <span className="profile-help">
            This is your public name. You can use your real name or a brand name.
          </span>
        </FormRow>

        <FormRow label="Username">
          <input
            className="profile-input profile-input-disabled"
            value={formData. username}
            placeholder="username"
            maxLength={200}
            disabled
          />
          <span className="profile-help">
            Username changes are currently disabled.  Contact support to change your username. 
          </span>
        </FormRow>

        <FormRow label="Website">
          <input
            className="profile-input"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://example.com"
            maxLength={500}
          />
        </FormRow>

        <FormRow label="Bio">
          <textarea
            className="profile-textarea"
            rows={3}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e. target.value)}
            placeholder="Share something about yourself or your gemstone business."
            maxLength={2000}
          />
          <span className="profile-help">
            {formData.bio?. length || 0}/2000 characters
          </span>
        </FormRow>

        <FormRow label="Email">
          <input
            className="profile-input profile-input-disabled"
            type="email"
            value={formData.email}
            placeholder="you@example.com"
            disabled
          />
          <span className="profile-help">
            Email changes require verification. Contact support to change your email.
          </span>
        </FormRow>

        <FormRow label="Account privacy">
          <div className="profile-toggle-row">
            <label className="profile-toggle">
              <input
                type="checkbox"
                checked={formData.privateProfile}
                onChange={(e) => handleInputChange('privateProfile', e.target.checked)}
              />
              <span className="profile-toggle-slider" />
              <span className="profile-toggle-label">Private account</span>
            </label>
            <span className="profile-help">
              When your account is private, only approved followers can see your listings and activity.
            </span>
          </div>
        </FormRow>

        <div className="profile-form-actions">
          <button
            type="submit"
            className="profile-save-btn"
            disabled={saving}
          >
            {saving ?  'Saving...' :  'Save'}
          </button>
          <button
            type="button"
            className="profile-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable FormRow component
const FormRow = ({ label, children }) => (
  <div className="profile-form-row">
    <label className="profile-label">{label}</label>
    <div className="profile-input-wrap">{children}</div>
  </div>
);

export default ProfileEditForm;