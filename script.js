const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },


    incomes(){
        let icome = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                icome += transaction.amount
            }
        })
        return icome
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('table tbody'),
    addTrasaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Util.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `
        return html
    },
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Util.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Util.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Util.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Util = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },
    formatDate(date){
        const splttedDate = date.split('-')
        return`${splttedDate[2]}/${splttedDate[1]}/${splttedDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : ''
        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValue(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const {description, amount, date} = Form.getValue()

        if(description.trim() === '' || amount.trim() === '' || date.trim() === ''){
            throw new Error('Por favor, preencha todos os campos')
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValue()
        amount = Util.formatAmount(amount)
        console.log(amount)
        date = Util.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },
    submit(event){
        event.preventDefault()
        
        try {
            Form.validateFields()
            Transaction.add(Form.formatValues())
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}


const App = {
    init(){
        Transaction.all.forEach((transaction, index) => DOM.addTrasaction(transaction, index))
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()