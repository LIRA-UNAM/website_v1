{
window.addEventListener('load', function () {
    document.getElementById('button-copy-text').addEventListener('click', function() {
        // 1. Get the text you want to copy
        const textToCopy = document.getElementById('copy-text').value;
        const $defaultMessage = document.getElementById('default-message');
        const $successMessage = document.getElementById('success-message');
        // 2. Use the modern Clipboard API
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Success: Notify the user
                // const messageElement = document.getElementById('message');
                // messageElement.textContent = 'Text successfully copied to clipboard!';
                showSuccess();
                setTimeout(() => {
                    resetToDefault();
                }, 2000);
            })
            .catch(err => {
                // Error: Handle cases where the API fails (e.g., due to browser permissions)
                console.error('Could not copy text: ', err);
                // document.getElementById('message').textContent = 'Error: Could not copy text.';
                // Fallback (see section below)
            });

        const showSuccess = () => {
            $defaultMessage.classList.add('hidden');
            $successMessage.classList.remove('hidden');
        }
    
        const resetToDefault = () => {
            $defaultMessage.classList.remove('hidden');
            $successMessage.classList.add('hidden');
        }

        });

})
    
}
// window.addEventListener('load', function () {
//     const clipboard = FlowbiteInstances.getInstance('CopyClipboard', 'npm-install-copy-text');

//     const $defaultMessage = document.getElementById('default-message');
//     const $successMessage = document.getElementById('success-message');

//     clipboard.updateOnCopyCallback((clipboard) => {
//         showSuccess();

//         // reset to default state
//         setTimeout(() => {
//             resetToDefault();
//         }, 2000);
//     })

//     const showSuccess = () => {
//         $defaultMessage.classList.add('hidden');
//         $successMessage.classList.remove('hidden');
//     }

//     const resetToDefault = () => {
//         $defaultMessage.classList.remove('hidden');
//         $successMessage.classList.add('hidden');
//     }
// })
