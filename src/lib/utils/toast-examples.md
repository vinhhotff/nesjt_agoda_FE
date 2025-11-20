# Toast Usage Guide

## Import
```typescript
import { toast } from '@/src/lib/utils/toast';
```

## Basic Usage

### Success Toast
```typescript
toast.success('✅ Operation completed successfully!');
toast.success('User created successfully');
```

### Error Toast
```typescript
toast.error('❌ Something went wrong!');
toast.error('Failed to save data');
```

### Warning Toast
```typescript
toast.warning('⚠️ Please check your input');
toast.warning('This action cannot be undone');
```

### Info Toast
```typescript
toast.info('ℹ️ New update available');
toast.info('Processing your request...');
```

### Loading Toast
```typescript
const loadingToast = toast.loading('Loading data...');

// Later, dismiss it
toast.dismiss(loadingToast);
```

## Advanced Usage

### Promise Toast (Auto-handling)
```typescript
// Automatically shows loading -> success/error
toast.promise(
  apiCall(),
  {
    pending: 'Saving changes...',
    success: 'Changes saved successfully!',
    error: 'Failed to save changes'
  }
);

// With dynamic messages
toast.promise(
  createUser(userData),
  {
    pending: 'Creating user...',
    success: (data) => `User ${data.name} created!`,
    error: (err) => `Error: ${err.message}`
  }
);
```

### Update Existing Toast
```typescript
const toastId = toast.loading('Processing...');

// Later update it
toast.update(toastId, {
  render: 'Processing complete!',
  type: 'success',
  isLoading: false,
  autoClose: 3000
});
```

### Custom Options
```typescript
toast.success('Custom toast', {
  autoClose: 5000,
  position: 'bottom-right',
  pauseOnHover: false
});
```

## Migration from old toast

### Before (react-toastify directly)
```typescript
import { toast } from 'react-toastify';

toast.success('Success!');
toast.error('Error!');
```

### After (custom toast utility)
```typescript
import { toast } from '@/src/lib/utils/toast';

toast.success('✅ Success!'); // With icon and gradient
toast.error('❌ Error!'); // With icon and gradient
```

## Examples in Components

### Form Submission
```typescript
const handleSubmit = async (data) => {
  try {
    await toast.promise(
      updateUser(data),
      {
        pending: 'Updating user...',
        success: 'User updated successfully!',
        error: 'Failed to update user'
      }
    );
    router.push('/users');
  } catch (error) {
    // Error already shown by toast.promise
  }
};
```

### Delete Confirmation
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  
  const loadingToast = toast.loading('Deleting...');
  
  try {
    await deleteItem(id);
    toast.dismiss(loadingToast);
    toast.success('✅ Deleted successfully!');
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('❌ Failed to delete');
  }
};
```

### API Call with Loading State
```typescript
const fetchData = async () => {
  const toastId = toast.loading('Fetching data...');
  
  try {
    const data = await api.getData();
    toast.update(toastId, {
      render: '✅ Data loaded!',
      type: 'success',
      isLoading: false,
      autoClose: 2000
    });
    return data;
  } catch (error) {
    toast.update(toastId, {
      render: '❌ Failed to load data',
      type: 'error',
      isLoading: false,
      autoClose: 3000
    });
  }
};
```
