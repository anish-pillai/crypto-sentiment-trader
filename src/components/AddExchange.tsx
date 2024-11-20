import { ApiKeyForm } from './ApiKeyForm';

export const AddExchange = ({ onClose }) => {
  return (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
          Add Exchange
        </h2>
        <ApiKeyForm />
        <div className='flex justify-end mt-4'>
          <button
            type='button'
            className='bg-red-500 text-white px-4 py-2 rounded mr-2'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
