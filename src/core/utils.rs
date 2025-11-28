pub fn format_number_with_spaces(input: &str) -> String {
    // Убираем любые нецифровые символы, если они присутствуют
    let digits: Vec<char> = input.chars().filter(|c| c.is_digit(10)).collect();
    let mut result = String::new();
    let mut counter = 0;

    // Проходим по числам справа налево
    for &c in digits.iter().rev() {
        if counter == 3 {
            result.push(' '); // Добавляем пробел после каждых 3 цифр
            counter = 0;
        }
        result.push(c);
        counter += 1;
    }

    // Переворачиваем строку, чтобы вернуть число в правильном порядке
    result.chars().rev().collect()
}
