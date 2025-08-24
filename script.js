// 生产日期编码生成器核心逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dateInput = document.getElementById('dateInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const productButtons = document.querySelectorAll('.product-btn');
    const selectedProductDisplay = document.getElementById('selectedProduct');
    const quantityInput = document.getElementById('quantityInput');
    const batchGenerateBtn = document.getElementById('batchGenerateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const batchResultSection = document.getElementById('batchResultSection');
    const batchOutput = document.getElementById('batchOutput');
    const downloadBatchBtn = document.getElementById('downloadBatchBtn');

    // 产品类型状态
    let selectedProductType = null;
    let currentCode = ''; // 存储当前生成的编码
    let batchCodes = []; // 存储批量生成的编码

    // 产品类型按钮点击事件
    productButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的选中状态
            productButtons.forEach(btn => btn.classList.remove('selected'));
            
            // 添加当前按钮的选中状态
            this.classList.add('selected');
            
            // 更新选中的产品类型
            selectedProductType = this.getAttribute('data-type');
            
            // 更新显示选中的产品类型
            selectedProductDisplay.textContent = selectedProductType;
        });
    });

    // 月份映射表
    const monthMap = {
        1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F',
        7: 'G', 8: 'H', 9: 'I', 10: 'J', 11: 'K', 12: 'L'
    };

    // 年份校验映射
    function getYearCheckDigit(yearLastTwo) {
        const lastDigit = parseInt(yearLastTwo.toString().slice(-1));
        return lastDigit >= 0 && lastDigit <= 5 ? 'A' : 'S';
    }

    // 日期校验映射
    function getDateCheckDigit(day) {
        if (day >= 1 && day <= 8) return 'A';
        if (day >= 9 && day <= 15) return 'B';
        if (day >= 16 && day <= 21) return 'C';
        if (day >= 22 && day <= 31) return 'D';
        return 'X'; // 无效日期
    }

    // 验证日期格式和有效性（包括30天限制）
    function validateDate(input) {
        // 检查是否为8位数字
        if (!/^\d{8}$/.test(input)) {
            return { isValid: false, error: '请输入8位数字日期格式 (YYYYMMDD)' };
        }

        // 解析年月日
        const year = parseInt(input.slice(0, 4));
        const month = parseInt(input.slice(4, 6));
        const day = parseInt(input.slice(6, 8));

        // 检查月份有效性
        if (month < 1 || month > 12) {
            return { isValid: false, error: '月份必须在1-12之间' };
        }

        // 检查日期有效性
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            return { isValid: false, error: `日期无效，${month}月最多有${daysInMonth}天` };
        }

        // 检查日期是否超过当前日期30天（北京时间）
        const inputDate = new Date(year, month - 1, day);
        const now = new Date();
        
        // 转换为北京时间（UTC+8）
        const beijingOffset = 8 * 60; // 8小时 * 60分钟
        const localOffset = now.getTimezoneOffset();
        const beijingNow = new Date(now.getTime() + (beijingOffset + localOffset) * 60000);
        
        // 设置时间为0点以便比较日期
        const today = new Date(beijingNow.getFullYear(), beijingNow.getMonth(), beijingNow.getDate());
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);
        
        if (inputDate > maxDate) {
            return { isValid: false, error: '日期不能超过当前日期30天' };
        }

        return { isValid: true, year, month, day };
    }

    // 生成编码
    function generateCode(year, month, day) {
        // 获取年份后两位
        const yearLastTwo = year.toString().slice(-2);
        
        // 获取年份校验字母
        const yearCheck = getYearCheckDigit(yearLastTwo);
        
        // 获取月份字母
        const monthLetter = monthMap[month];
        
        // 格式化日期为两位数字
        const formattedDay = day.toString().padStart(2, '0');
        
        // 获取日期校验字母
        const dayCheck = getDateCheckDigit(day);
        
        // 组合最终编码（包含厂家编码SK和产品类型）
        const originalCode = `${yearLastTwo}${yearCheck}-${monthLetter}${formattedDay}${dayCheck}`;
        return `SK-${selectedProductType}-${originalCode}`;
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
        batchResultSection.style.display = 'none';
    }

    // 显示单个编码结果
    function showResult(code) {
        currentCode = code;
        output.textContent = code;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
        batchResultSection.style.display = 'none';
        downloadBtn.style.display = 'block';
        
    }

    // 显示批量生成结果
    function showBatchResult(codes) {
        batchCodes = codes;
        batchOutput.innerHTML = codes.map(code =>
            `<div class="batch-code-item">${code}</div>`
        ).join('');
        batchResultSection.style.display = 'block';
        resultSection.style.display = 'none';
        errorSection.style.display = 'none';
    }

    // 生成批量编码
    function generateBatchCodes(baseCode, quantity) {
        const codes = [];
        for (let i = 1; i <= quantity; i++) {
            const sequence = i.toString().padStart(4, '0');
            codes.push(`${baseCode}${sequence}`);
        }
        return codes;
    }


    // 下载单个编码为文本文件
    function downloadSingleCode() {
        const blob = new Blob([currentCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `生产编码_${currentCode}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    // 下载批量编码为CSV文件
    function downloadBatchCodes() {
        const csvContent = batchCodes.map(code => `"${code}"`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `批量生产编码_${batchCodes.length}个.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 生成按钮点击事件
    generateBtn.addEventListener('click', function() {
        // 检查是否选择了产品类型
        if (!selectedProductType) {
            showError('请先选择产品类型');
            return;
        }

        const input = dateInput.value.trim();
        
        if (!input) {
            showError('请输入生产日期');
            return;
        }

        const validation = validateDate(input);
        if (!validation.isValid) {
            showError(validation.error);
            return;
        }

        const { year, month, day } = validation;
        const code = generateCode(year, month, day);
        showResult(code);
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', function() {
        const code = output.textContent;
        navigator.clipboard.writeText(code).then(() => {
            // 显示复制成功提示
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制编码');
        });
    });

    // 输入框回车键支持
    dateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    // 输入框获得焦点时自动选择所有文本
    dateInput.addEventListener('focus', function() {
        this.select();
    });
    // 批量生成按钮点击事件
    batchGenerateBtn.addEventListener('click', function() {
        // 检查是否选择了产品类型
        if (!selectedProductType) {
            showError('请先选择产品类型');
            return;
        }

        const input = dateInput.value.trim();
        
        if (!input) {
            showError('请输入生产日期');
            return;
        }

        // 检查生产数量
        const quantity = parseInt(quantityInput.value);
        if (!quantity || quantity < 1 || quantity > 5000) {
            showError('请输入有效的生产数量 (1-5000)');
            return;
        }

        const validation = validateDate(input);
        if (!validation.isValid) {
            showError(validation.error);
            return;
        }

        const { year, month, day } = validation;
        const baseCode = generateCode(year, month, day);
        const batchCodes = generateBatchCodes(baseCode, quantity);
        showBatchResult(batchCodes);
    });

    // 下载单个编码按钮点击事件
    downloadBtn.addEventListener('click', function() {
        if (currentCode) {
            downloadSingleCode();
        }
    });

    // 下载批量编码按钮点击事件
    downloadBatchBtn.addEventListener('click', function() {
        if (batchCodes.length > 0) {
            downloadBatchCodes();
        }
    });

    // 生产数量输入框限制
    quantityInput.addEventListener('input', function() {
        if (this.value > 5000) {
            this.value = 5000;
        } else if (this.value < 1) {
            this.value = 1;
        }
    });

    // 生产数量输入框回车键支持
    quantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            batchGenerateBtn.click();
        }
    });

});
