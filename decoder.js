// 生产日期解码器核心逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const codeInput = document.getElementById('codeInput');
    const decodeBtn = document.getElementById('decodeBtn');
    const resultSection = document.getElementById('resultSection');
    const output = document.getElementById('output');
    const warrantyInfo = document.getElementById('warrantyInfo');
    const warningInfo = document.getElementById('warningInfo');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');

    // 月份映射表（反向）
    const monthReverseMap = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6,
        'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12
    };

    // 日期校验映射（反向）
    function getDateCheckDigitReverse(day) {
        if (day >= 1 && day <= 8) return 'A';
        if (day >= 9 && day <= 15) return 'B';
        if (day >= 16 && day <= 21) return 'C';
        if (day >= 22 && day <= 31) return 'D';
        return 'X'; // 无效日期
    }

    // 年份校验映射（反向）
    function getYearCheckDigitReverse(yearLastTwo) {
        const lastDigit = parseInt(yearLastTwo.toString().slice(-1));
        return lastDigit >= 0 && lastDigit <= 5 ? 'A' : 'S';
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
    }

    // 显示解码结果
    function showResult(productType, productionDate, warrantyDays, remainingDays) {
        const dateStr = productionDate.toLocaleDateString('zh-CN');
        const enDateStr = productionDate.toLocaleDateString('en-US');
        
        output.innerHTML = `
            <div><strong>产品类型:</strong> ${productType}</div>
            <div><strong>生产日期:</strong> ${dateStr} (${enDateStr})</div>
            <div><strong>质保期限:</strong> ${warrantyDays}天</div>
        `;

        // 质保信息
        if (remainingDays > 0) {
            warrantyInfo.innerHTML = `
                <div class="warranty-valid">
                    <strong>剩余质保天数: ${remainingDays}天</strong><br>
                    <strong>Remaining Warranty Days: ${remainingDays} days</strong>
                </div>
            `;
        } else {
            warrantyInfo.innerHTML = `
                <div class="warranty-expired">
                    <strong>质保已过期</strong><br>
                    <strong>Warranty Expired</strong>
                </div>
            `;
        }

        // 警告信息（针对SCC/HCC）
        if (productType === 'SCC' || productType === 'HCC') {
            warningInfo.innerHTML = `
                <div class="warning">
                    <strong>警告: SCC/HCC一经使用则质保失效，不再享受质保</strong><br>
                    <strong>Warning: SCC/HCC warranty becomes void once used, no longer eligible for warranty</strong>
                </div>
            `;
        } else {
            warningInfo.innerHTML = '';
        }

        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // 解析编码
    function parseCode(input) {
        // 标准化输入：移除所有非字母数字字符，转换为大写
        let cleanInput = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // 移除开头的"SK"（厂家代号）
        if (cleanInput.startsWith('SK')) {
            cleanInput = cleanInput.substring(2);
        }
        
        // 如果字符串正好7个字符，假设只有日期部分
        if (cleanInput.length === 7) {
            return { productType: 'AUTO', code: cleanInput };
        }
        
        // 定义已知产品类型
        const productTypes = ['SCC', 'HCC', 'SCAP', 'HCAP'];
        let productType = null;
        let datePart = null;
        
        // 检查是否以产品类型开头
        for (const type of productTypes) {
            if (cleanInput.startsWith(type)) {
                productType = type;
                // 提取日期部分：产品类型后的7个字符
                datePart = cleanInput.substring(type.length, type.length + 7);
                break;
            }
        }
        
        if (!productType || !datePart || datePart.length < 7) {
            return null; // 无法解析
        }
        
        return { productType, code: datePart };
    }

    // 解码日期部分
    function decodeDate(code, productType) {
        // 编码格式: YYCMMDDZ
        if (code.length !== 7) {
            return { isValid: false, error: '编码格式错误，应为7位字符' };
        }

        const yearPart = code.slice(0, 2); // YY
        const yearCheck = code.slice(2, 3); // C
        const monthChar = code.slice(3, 4); // M (字母)
        const dayPart = code.slice(4, 6); // DD
        const dayCheck = code.slice(6, 7); // Z

        // 验证年份校验码
        const expectedYearCheck = getYearCheckDigitReverse(yearPart);
        if (yearCheck !== expectedYearCheck) {
            return { isValid: false, error: '年份校验码不匹配' };
        }

        // 解码月份
        if (!monthReverseMap[monthChar]) {
            return { isValid: false, error: '无效的月份代码' };
        }
        const month = monthReverseMap[monthChar];

        // 解码日期
        const day = parseInt(dayPart);
        if (isNaN(day) || day < 1 || day > 31) {
            return { isValid: false, error: '无效的日期' };
        }

        // 验证日期校验码
        const expectedDayCheck = getDateCheckDigitReverse(day);
        if (dayCheck !== expectedDayCheck) {
            return { isValid: false, error: '日期校验码不匹配' };
        }

        // 构建完整年份（假设为2000年代）
        const fullYear = 2000 + parseInt(yearPart);

        // 创建生产日期对象
        const productionDate = new Date(fullYear, month - 1, day);

        // 验证日期有效性
        if (productionDate.getMonth() + 1 !== month || productionDate.getDate() !== day) {
            return { isValid: false, error: '无效的生产日期' };
        }

        return { isValid: true, productionDate };
    }

    // 获取质保天数
    function getWarrantyDays(productType) {
        if (productType === 'SCAP' || productType === 'HCAP') {
            return 420;
        } else if (productType === 'SCC' || productType === 'HCC') {
            return 360;
        }
        return 0; // 未知类型
    }

    // 计算剩余质保天数
    function calculateRemainingDays(productionDate, warrantyDays) {
        const now = new Date();
        const warrantyEnd = new Date(productionDate);
        warrantyEnd.setDate(warrantyEnd.getDate() + warrantyDays);
        
        const remainingMs = warrantyEnd - now;
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        
        return remainingDays;
    }

    // 解码按钮点击事件
    decodeBtn.addEventListener('click', function() {
        const input = codeInput.value.trim();
        
        if (!input) {
            showError('请输入产品编码');
            return;
        }

        // 解析编码
        const parsed = parseCode(input);
        if (!parsed) {
            showError('编码格式无法识别');
            return;
        }

        let { productType, code } = parsed;

        // 如果是自动识别，尝试从编码中推断产品类型
        if (productType === 'AUTO') {
            // 这里简单假设，实际可能需要更复杂的逻辑
            // 根据常见类型尝试
            const possibleTypes = ['SCC', 'HCC', 'SCAP', 'HCAP'];
            let validType = null;
            
            for (const type of possibleTypes) {
                // 尝试用每种类型解码
                const result = decodeDate(code, type);
                if (result.isValid) {
                    validType = type;
                    break;
                }
            }
            
            if (!validType) {
                showError('无法自动识别产品类型，请使用完整编码格式');
                return;
            }
            
            productType = validType;
        }

        // 解码日期
        const dateResult = decodeDate(code, productType);
        if (!dateResult.isValid) {
            showError(dateResult.error + '\n非Feaglet原厂编码，请与供应商核实避免购入假货\nNot genuine Feaglet code, please verify with supplier to avoid counterfeit products');
            return;
        }

        // 获取质保信息
        const warrantyDays = getWarrantyDays(productType);
        const remainingDays = calculateRemainingDays(dateResult.productionDate, warrantyDays);

        // 显示结果
        showResult(productType, dateResult.productionDate, warrantyDays, remainingDays);
    });

    // 输入框回车键支持
    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            decodeBtn.click();
        }
    });

    // 输入框获得焦点时自动选择所有文本
    codeInput.addEventListener('focus', function() {
        this.select();
    });
});