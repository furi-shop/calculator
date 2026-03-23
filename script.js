function addProductRow() {
    const productContainer = document.getElementById('product-container');
    const newGroup = document.createElement('div');
    newGroup.className = 'form-group';
    newGroup.innerHTML = `
        <div class="long"><input type="number" name="originalPrice" placeholder="日幣價格" required></div>
        <div class="long"><input type="number" name="discount" placeholder="3折填0.3"></div>
        <div>
            <select name="itemType" required>
                <option value="inStock">現貨</option>
                <option value="cosmetic">彩妝類</option>
                <option value="saleSeason">折扣季特殊計價</option>
                <option value="pium">Pium轉發分享優惠匯率</option>
            </select>
        </div>`;
    productContainer.appendChild(newGroup);
}

function calculateFinalPrice() {
    const products = document.querySelectorAll('.form-group');
    let totalCost = 0;
    let costSubjectToServiceFee = 0; 
    const real_exchangeRate = 0.235;

    products.forEach(group => {
        const originalPrice = parseFloat(group.querySelector('input[name="originalPrice"]').value);
        const discount = parseFloat(group.querySelector('input[name="discount"]').value) || 1;
        const itemType = group.querySelector('select[name="itemType"]').value;
        
        if (isNaN(originalPrice) || originalPrice <= 0) return;

        const finalPriceInYen = Math.ceil(originalPrice * discount);
        let exchangeRate;
        let additionalFee = 0;
        let skipMinCheck = false;
        let skipServiceFee = false;

        if (itemType === "cosmetic") {
            exchangeRate = 0.26;
            additionalFee = 50;
            skipMinCheck = true;
            skipServiceFee = true;
        } else if (itemType === "pium") {
            exchangeRate = 0.22;
            additionalFee = 0;
            skipMinCheck = true;
            skipServiceFee = true;
        } else {
            if (finalPriceInYen <= 2000) {
                exchangeRate = 0.3;
            } else if (finalPriceInYen <= 6000) {
                exchangeRate = 0.25;
                additionalFee = 45;
            } else {
                exchangeRate = 0.25;
                additionalFee = 35;
            }
        }

        let finalPriceInDollars = Math.ceil(finalPriceInYen * exchangeRate + additionalFee);

        if (itemType === "saleSeason") {
            if (finalPriceInDollars - finalPriceInYen * real_exchangeRate < 150) {
                finalPriceInDollars = Math.ceil(finalPriceInYen * real_exchangeRate) + 150;
            } else {
                finalPriceInDollars = Math.ceil(finalPriceInYen * 0.255);
            }
        } else if (!skipMinCheck) {
            if (finalPriceInDollars - finalPriceInYen * real_exchangeRate < 100) {
                finalPriceInDollars = Math.ceil(finalPriceInYen * real_exchangeRate) + 100;
            }
        }

        totalCost += finalPriceInDollars;
        if (!skipServiceFee) costSubjectToServiceFee += finalPriceInDollars;
    });
    
    let serviceFee = 0;
    if (costSubjectToServiceFee > 0) {
        serviceFee = Math.ceil(costSubjectToServiceFee * 0.0105);
        if (serviceFee < 15) serviceFee = 15;
    }
    
    const totalWithFee = totalCost + serviceFee;
    const resultDiv = document.getElementById("finalPrice");

    if (totalCost <= 0) {
        resultDiv.innerHTML = "請輸入商品日幣價格 (¥)";
    } else {
        resultDiv.innerHTML = "預估價格為台幣: $" + totalWithFee + " + 二補國際運費";
    }
}
