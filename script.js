// ==========================================
// НАЛАШТУВАННЯ
// ==========================================
const dumbtax = 0; // 1 = увімкнено ПДВ 20% на матеріали, 0 = вимкнено


// DOM Elements
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const rateUsdInput = document.getElementById('rateUsdInput');
const usdRateInput = document.getElementById('usdRateInput');

const rateModeManual = document.getElementById('rateModeManual');
const rateModeNbu = document.getElementById('rateModeNbu');

const colorsContainer = document.getElementById('colorsContainer');
const addColorBtn = document.getElementById('addColorBtn');

const supportFilamentTypeInput = document.getElementById('supportFilamentTypeInput');
const supportWeightInput = document.getElementById('supportWeightInput');
const supportSpoolPriceInput = document.getElementById('supportSpoolPriceInput');

const extraServicesInput = document.getElementById('extraServicesInput');
const markupInput = document.getElementById('markupInput');
const vatCheckbox = document.getElementById('vatCheckbox');
const vatLabel = document.getElementById('vatLabel');

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
const summaryVatRow = document.getElementById('summaryVatRow');
const summaryVatCost = document.getElementById('summaryVatCost');
const estimatedProfit = document.getElementById('estimatedProfit');

const clientTextOutput = document.getElementById('clientTextOutput');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');

// Змінна стану режима курсу ('manual' або 'nbu')
let currentRateMode = 'nbu';

// Setup VAT Checkbox state based on dumbtax variable
function setupVatState() {
    if (!vatCheckbox || !vatLabel) return;

    if (dumbtax === 1) {
        vatCheckbox.disabled = false;
        vatLabel.title = "";
        vatLabel.classList.remove('cursor-not-allowed', 'opacity-50');
        vatLabel.classList.add('cursor-pointer');
        vatCheckbox.classList.remove('cursor-not-allowed');
        vatCheckbox.classList.add('cursor-pointer');
    } else {
        vatCheckbox.disabled = true;
        vatCheckbox.checked = false;
        vatLabel.title = "доступно з 1 липня 2027 року";
        vatLabel.classList.add('cursor-not-allowed', 'opacity-50');
        vatLabel.classList.remove('cursor-pointer');
        vatCheckbox.classList.add('cursor-not-allowed');
        vatCheckbox.classList.remove('cursor-pointer');
    }
}

// Update UI and behavior of Rate Switcher
function updateRateModeUI() {
    if (currentRateMode === 'nbu') {
        rateModeNbu.className = "px-2 py-0.5 rounded-md font-medium transition-all bg-brand-600 text-white shadow";
        rateModeManual.className = "px-2 py-0.5 rounded-md font-medium transition-all text-slate-400 hover:text-slate-200";
        
        usdRateInput.readOnly = true;
        usdRateInput.title = "Офіційний курс НБУ (автоматично)";
        usdRateInput.classList.add('opacity-70', 'cursor-not-allowed');
        fetchOfficialUsdRate();
    } else {
        rateModeManual.className = "px-2 py-0.5 rounded-md font-medium transition-all bg-brand-600 text-white shadow";
        rateModeNbu.className = "px-2 py-0.5 rounded-md font-medium transition-all text-slate-400 hover:text-slate-200";
        
        usdRateInput.readOnly = false;
        usdRateInput.title = "Ручне введення курсу";
        usdRateInput.classList.remove('opacity-70', 'cursor-not-allowed');
        calculate();
        saveState();
    }
}

// Fetch official USD rate from NBU API
async function fetchOfficialUsdRate() {
    if (currentRateMode !== 'nbu') return;
    try {
        const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json');
        const data = await response.json();
        if (data && data.length > 0 && data[0].rate) {
            usdRateInput.value = data[0].rate.toFixed(2);
            calculate();
            saveState();
        }
    } catch (e) {
        console.error("Помилка отримання курсу НБУ:", e);
    }
}

// Save state to localStorage
function saveState() {
    const state = {
        rateMode: currentRateMode,
        hours: hoursInput.value,
        minutes: minutesInput.value,
        rateUsd: rateUsdInput.value,
        usdRate: usdRateInput.value,
        supportType: supportFilamentTypeInput.value,
        supportWeight: supportWeightInput.value,
        supportSpoolPrice: supportSpoolPriceInput.value,
        extraServices: extraServicesInput.value,
        markup: markupInput.value,
        vatChecked: vatCheckbox ? vatCheckbox.checked : false,
        colors: []
    };

    colorsContainer.querySelectorAll('.color-row').forEach(row => {
        state.colors.push({
            name: row.querySelector('.color-name').value,
            weight: row.querySelector('.color-weight').value,
            price: row.querySelector('.color-price').value
        });
    });

    localStorage.setItem('calc3dState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('calc3dState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            currentRateMode = state.rateMode ?? 'nbu';
            hoursInput.value = state.hours ?? "0";
            minutesInput.value = state.minutes ?? "0";
            rateUsdInput.value = state.rateUsd ?? "0";
            
            if (currentRateMode === 'manual') {
                usdRateInput.value = state.usdRate ?? "0";
            }

            supportFilamentTypeInput.value = state.supportType ?? "";
            supportWeightInput.value = state.supportWeight ?? "0";
            supportSpoolPriceInput.value = state.supportSpoolPrice ?? "0";
            extraServicesInput.value = state.extraServices ?? "0";
            markupInput.value = state.markup ?? "0";
            if (vatCheckbox) vatCheckbox.checked = state.vatChecked ?? false;

            colorsContainer.innerHTML = "";
            if (state.colors && state.colors.length > 0) {
                state.colors.forEach(c => {
                    createColorRow(c.name, c.weight, c.price);
                });
            } else {
                createColorRow("", 0, 0);
            }
            return true;
        } catch (e) {
            console.error("Помилка завантаження збережених даних:", e);
        }
    }
    return false;
}

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

    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', () => {
        calculate();
        saveState();
    }));

    const removeBtn = row.querySelector('.remove-color-btn');
    removeBtn.addEventListener('click', () => {
        if (colorsContainer.querySelectorAll('.color-row').length > 1) {
            row.remove();
            calculate();
            saveState();
        } else {
            alert('Повинен залишатися хоча б один основний пластик!');
        }
    });

    colorsContainer.appendChild(row);
}

// Main calculation logic
function calculate() {
    const hrs = parseFloat(hoursInput.value) || 0;
    const mins = parseFloat(minutesInput.value) || 0;
    const totalHours = hrs + (mins / 60);

    const rateUsd = parseFloat(rateUsdInput.value) || 0;
    const usdRate = parseFloat(usdRateInput.value) || 0;
    const hourlyRateUah = rateUsd * usdRate;

    const printTimeCost = totalHours * hourlyRateUah;

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

    const supportWeight = parseFloat(supportWeightInput.value) || 0;
    const supportSpoolPrice = parseFloat(supportSpoolPriceInput.value) || 0;
    const supportPricePerGram = supportSpoolPrice / 1000;
    const supportCost = supportWeight * supportPricePerGram;

    const extraServices = parseFloat(extraServicesInput.value) || 0;
    const subtotal = printTimeCost + totalPrimaryCost + supportCost + extraServices;

    const markupPercent = parseFloat(markupInput.value) || 0;
    const markupCost = subtotal * (markupPercent / 100);

    // 4. VAT Calculation (Only if dumbtax === 1 and checkbox is checked)
    // Тепер ПДВ (20%) рахується виключно від вартості використаних матеріалів (основний пластик + підтримка),
    // що пропорційно розподіляє податок на катушку між клієнтами за їхню витрачену вагу в грамах.
    let vatCost = 0;
    const isVatApplied = (dumbtax === 1) && vatCheckbox && vatCheckbox.checked;
    
    if (isVatApplied) {
        vatCost = (totalPrimaryCost + supportCost) * 0.20;
    }

    let grandTotal = subtotal + markupCost + vatCost;

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

    if (isVatApplied) {
        summaryVatRow.classList.remove('hidden');
        summaryVatCost.textContent = `${vatCost.toFixed(2)} грн`;
    } else {
        summaryVatRow.classList.add('hidden');
    }

    const approxProfit = printTimeCost + extraServices + markupCost;
    estimatedProfit.textContent = `~${Math.round(approxProfit)} грн`;

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

    if (isVatApplied) {
        clientReceipt += `📄 ПДВ (20%): ${vatCost.toFixed(2)} грн\n`;
    }

    clientReceipt += `-----------------------------------\n`;
    clientReceipt += `💰 ЗАГАЛОМ ДО СПЛАТИ: ${Math.round(grandTotal)} грн`;

    clientTextOutput.value = clientReceipt;
    
    saveState();
}

// Reset to default zero values function
function resetToDefaults() {
    localStorage.removeItem('calc3dState');
    
    hoursInput.value = "0";
    minutesInput.value = "0";
    rateUsdInput.value = "0";
    
    currentRateMode = 'nbu';
    updateRateModeUI();
    
    colorsContainer.innerHTML = "";
    createColorRow("", 0, 0);

    supportFilamentTypeInput.value = "";
    supportWeightInput.value = "0";
    supportSpoolPriceInput.value = "0";

    extraServicesInput.value = "0";
    markupInput.value = "0";

    setupVatState();
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

if (vatCheckbox) {
    vatCheckbox.addEventListener('change', calculate);
}

rateModeManual.addEventListener('click', () => {
    currentRateMode = 'manual';
    updateRateModeUI();
});

rateModeNbu.addEventListener('click', () => {
    currentRateMode = 'nbu';
    updateRateModeUI();
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

// Initial Setup on Load
document.addEventListener('DOMContentLoaded', () => {
    setupVatState();
    const hasLoaded = loadState();
    if (!hasLoaded) {
        createColorRow("", 0, 0);
    }
    updateRateModeUI();
});