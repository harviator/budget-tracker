let db;

const request = indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore('BudgetStore', { autoIncrement: true});
};

request.onerror = function (e) {
    console.log(`Error ${e.target.errorCode}`);
};

function checkDatabase() {
    console.log('Check DB Invoked');

    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    
                    if (res.length !== 0) {
                        
                        transaction = db.transaction(['BudgetStore'], 'readwrite');

                        const currentStore = transaction.objectStore('BudgetStore');

                        currentStore.clear();
                        console.log('Cleared store');
                    }
                });
        }
    };
}

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;

    if (navigator.onLine) {
        console.log('Server online');
        checkDatabase();
    }
};
function saveRecord(record) {
    console.log('Save record invoked');
    
    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
};

window.addEventListener('online', checkDatabase);