// DOM Elements
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const rateUsdInput = document.getElementById('rateUsdInput');
const usdRateInput = document.getElementById('usdRateInput');

const colorsContainer = document.getElementById('colorsContainer');
const addColorBtn = document.getElementById('addColorBtn');

const supportFilamentTypeInput = document.getElementById('supportFilamentTypeInput');
const supportWeightInput = document.getElementById('supportWeightInput');
const supportSpoolPriceInput = document.getElementById('supportSpoolPriceInput');

const extraServicesInput = document.getElementById('extraServicesInput');
const markupInput = document.getElementById('markupInput');

// Output DOM Elements
const hourlyRateUahCalc = document.getElementById('hourlyRateUahCalc');
const totalPriceDisplay = document.getElementById('totalPriceDisplay');

const summaryTimeText = document.getElementById('summaryTimeText');
const summaryTimeCost = document.getElementById('summaryTimeCost');
const summaryWeightText = document.getElementById('summaryWeightText');
const summaryFilamentCost = document.getElementById('summaryFilamentCost');
const summarySupportRow = document.getElementById('summarySupportRow');
const summarySupportWeightText = document.getElementById('summarySupportWeightText');
const summarySupportCost = document.getElementById('summarySupportCost');
const summaryExtraRow = document.getElementById('summaryExtraRow');
const summaryExtraCost = document.getElementById('summaryExtraCost');
const summaryMarkupRow = document.getElementById('summaryMarkupRow');
const summaryMarkupCost = document.getElementById('summaryMarkupCost');
const estimatedProfit = document.getElementById('estimatedProfit');

const clientTextOutput = document.getElementById('clientTextOutput');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');

// Helper to create a color row element
function createColorRow(name = "", weight = 0, price = 0) {
    const row = document.createElement('div');
    row.className = "color-row grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 relative";
    
    row.innerHTML = `
        <div class="sm:col-span-5">
            <label class="block text-[10px] font-medium text-slate-400 mb-1">Колір / Назва</label>
            <input type="text" class="color-name w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-brand-500 transition-colors" value="${name}" placeholder="Наприклад, PLA">
        </div>
        <div class="sm:col-span-3">
            <label class="block text-[10px] font-medium text-slate-400 mb-1">Вага (г)</label>
            <input type="number" min="0" class="color-weight w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-brand-500 transition-colors" value="${weight}">
        </div>
        <div class="sm:col-span-3">
            <label class="block text-[10px] font-medium text-slate-400 mb-1">Катушка (грн/кг)</label>
            <input type="number" min="0" class="color-price w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-brand-500 transition-colors" value="${price}">
        </div>
        <div class="sm:col-span-1 flex justify-end items-end pt-2 sm:pt-0">
            <button type="button" class="remove-color-btn text-slate-500 hover:text-red-400 p-2 transition-colors flex items-center justify-center" title="Видалити колір">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        </div>
    `;

    // Attach listeners
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', calculate));

    const removeBtn = row.querySelector('.remove-color-btn');
    removeBtn.addEventListener('click', () => {
        if (colorsContainer.querySelectorAll('.color-row').length > 1) {
            row.remove();
            calculate();
        } else {
            alert('Повинен залишатися хоча б один основний пластик!');
        }
    });

    colorsContainer.appendChild(row);
}

// Main calculation logic
function calculate() {
    // 1. Time Calculation
    const hrs = parseFloat(hoursInput.value) || 0;
    const mins = parseFloat(minutesInput.value) || 0;
    const totalHours = hrs + (mins / 60);

    const rateUsd = parseFloat(rateUsdInput.value) || 0;
    const usdRate = parseFloat(usdRateInput.value) || 0;
    const hourlyRateUah = rateUsd * usdRate;

    const printTimeCost = totalHours * hourlyRateUah;

    // 2. Primary Colors Calculation
    const colorRows = colorsContainer.querySelectorAll('.color-row');
    let totalPrimaryWeight = 0;
    let totalPrimaryCost = 0;
    let colorsData = [];

    colorRows.forEach(row => {
        const name = row.querySelector('.color-name').value.trim() || "Пластик";
        const weight = parseFloat(row.querySelector('.color-weight').value) || 0;
        const spoolPrice = parseFloat(row.querySelector('.color-price').value) || 0;
        const pricePerGram = spoolPrice / 1000;
        const cost = weight * pricePerGram;

        totalPrimaryWeight += weight;
        totalPrimaryCost += cost;

        colorsData.push({ name, weight, pricePerGram, cost });
    });

    // Support Filament Calculation
    const supportWeight = parseFloat(supportWeightInput.value) || 0;
    const supportSpoolPrice = parseFloat(supportSpoolPriceInput.value) || 0;
    const supportPricePerGram = supportSpoolPrice / 1000;
    const supportCost = supportWeight * supportPricePerGram;

    // 3. Extra Fees & Markup
    const extraServices = parseFloat(extraServicesInput.value) || 0;
    const subtotal = printTimeCost + totalPrimaryCost + supportCost + extraServices;

    const markupPercent = parseFloat(markupInput.value) || 0;
    const markupCost = subtotal * (markupPercent / 100);

    const grandTotal = subtotal + markupCost;

    // Update UI Displays
    hourlyRateUahCalc.textContent = `${hourlyRateUah.toFixed(2)} грн/год`;
    totalPriceDisplay.textContent = Math.round(grandTotal);

    summaryTimeText.textContent = `${totalHours.toFixed(2)} год`;
    summaryTimeCost.textContent = `${printTimeCost.toFixed(2)} грн`;

    summaryWeightText.textContent = `${totalPrimaryWeight} г`;
    summaryFilamentCost.textContent = `${totalPrimaryCost.toFixed(2)} грн`;

    if (supportWeight > 0) {
        summarySupportRow.classList.remove('hidden');
        summarySupportWeightText.textContent = `${supportWeight} г`;
        summarySupportCost.textContent = `${supportCost.toFixed(2)} грн`;
    } else {
        summarySupportRow.classList.add('hidden');
    }

    if (extraServices > 0) {
        summaryExtraRow.classList.remove('hidden');
        summaryExtraCost.textContent = `${extraServices.toFixed(2)} грн`;
    } else {
        summaryExtraRow.classList.add('hidden');
    }

    if (markupPercent !== 0) {
        summaryMarkupRow.classList.remove('hidden');
        summaryMarkupCost.textContent = `${markupCost > 0 ? '+' : ''}${markupCost.toFixed(2)} грн (${markupPercent}%)`;
    } else {
        summaryMarkupRow.classList.add('hidden');
    }

    // Estimate profit
    const approxProfit = printTimeCost + extraServices + markupCost;
    estimatedProfit.textContent = `~${Math.round(approxProfit)} грн`;

    // 4. Format Client Text
    let timeStr = "";
    if (hrs > 0 && mins > 0) {
        timeStr = `${hrs} год ${mins} хв (${totalHours.toFixed(2)} год)`;
    } else if (hrs > 0) {
        timeStr = `${hrs} год (${totalHours.toFixed(2)} год)`;
    } else {
        timeStr = `${mins} хв (${totalHours.toFixed(2)} год)`;
    }

    let clientReceipt = `--- РОЗРАХУНОК ВАРТОСТІ 3D-ДРУКУ ---\n`;
    clientReceipt += `⏱ Час друку: ${timeStr} х ${hourlyRateUah.toFixed(2)} грн/год = ${printTimeCost.toFixed(2)} грн\n`;

    colorsData.forEach((col) => {
        clientReceipt += `🧵 Матеріал [${col.name}]: ${col.weight} г х ${col.pricePerGram.toFixed(2)} грн/г = ${col.cost.toFixed(2)} грн\n`;
    });

    if (supportWeight > 0) {
        const supportName = supportFilamentTypeInput.value.trim() || "Підтримка";
        clientReceipt += `🧵 Підтримка [${supportName}]: ${supportWeight} г х ${supportPricePerGram.toFixed(2)} грн/г = ${supportCost.toFixed(2)} грн\n`;
    }

    if (extraServices > 0) {
        clientReceipt += `🛠 Додаткова обробка / підготовка: ${extraServices.toFixed(2)} грн\n`;
    }

    if (markupPercent !== 0) {
        clientReceipt += `📊 Націнка/Коригування (${markupPercent}%): ${markupCost.toFixed(2)} грн\n`;
    }

    clientReceipt += `-----------------------------------\n`;
    clientReceipt += `💰 ЗАГАЛОМ ДО СПЛАТИ: ${Math.round(grandTotal)} грн`;

    clientTextOutput.value = clientReceipt;
}

// Reset to default zero values function
function resetToDefaults() {
    hoursInput.value = "0";
    minutesInput.value = "0";
    rateUsdInput.value = "0";
    usdRateInput.value = "45.5";
    
    colorsContainer.innerHTML = "";
    createColorRow("", 0, 0);

    supportFilamentTypeInput.value = "";
    supportWeightInput.value = "0";
    supportSpoolPriceInput.value = "0";

    extraServicesInput.value = "0";
    markupInput.value = "0";
    
    calculate();
}

// Copy to clipboard mechanism
function copyToClipboard() {
    const copyText = document.getElementById("clientTextOutput");
    copyText.select();
    copyText.setSelectionRange(0, 99999);

    try {
        document.execCommand('copy');
        
        const toast = document.getElementById("toast");
        toast.classList.remove("opacity-0", "pointer-events-none", "translate-y-3");
        toast.classList.add("opacity-100", "translate-y-0");

        const btnText = document.getElementById("copyBtnText");
        const originalText = btnText.textContent;
        btnText.textContent = "Скопійовано!";

        setTimeout(() => {
            toast.classList.remove("opacity-100", "translate-y-0");
            toast.classList.add("opacity-0", "pointer-events-none", "translate-y-3");
            btnText.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Помилка копіювання: ', err);
    }
}

// Attach event listeners to static inputs
[hoursInput, minutesInput, rateUsdInput, usdRateInput, supportFilamentTypeInput, supportWeightInput, supportSpoolPriceInput, extraServicesInput, markupInput].forEach(input => {
    input.addEventListener('input', calculate);
});

addColorBtn.addEventListener('click', () => {
    createColorRow("", 0, 0);
    calculate();
});

if (copyBtn) {
    copyBtn.addEventListener('click', copyToClipboard);
}

if (resetBtn) {
    resetBtn.addEventListener('click', resetToDefaults);
}

// Initial Setup on Load with zero values
document.addEventListener('DOMContentLoaded', () => {
    createColorRow("", 0, 0);
    calculate();
});