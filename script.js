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

    // 验证日期格式和有效性
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
        
        // 组合最终编码
        return `${yearLastTwo}${yearCheck}-${monthLetter}${formattedDay}${dayCheck}`;
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
    }

    // 显示结果
    function showResult(code) {
        output.textContent = code;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // 生成按钮点击事件
    generateBtn.addEventListener('click', function() {
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
});