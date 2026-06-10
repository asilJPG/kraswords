// Maps Supabase auth + common errors to user-friendly Russian.
export function humanizeAuthError(message: string | undefined | null): string {
  if (!message) return 'Что-то пошло не так. Попробуй ещё раз.'
  const m = message.toLowerCase()

  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Неверный логин или пароль'
  }
  if (m.includes('email not confirmed')) {
    return 'Email не подтверждён. Проверь почту — мы прислали ссылку.'
  }
  if (m.includes('user already registered') || m.includes('already exists')) {
    return 'Этот email уже зарегистрирован. Попробуй войти.'
  }
  if (m.includes('password should be at least')) {
    return 'Пароль слишком короткий — минимум 8 символов'
  }
  if (m.includes('weak password') || m.includes('password is too weak')) {
    return 'Слишком простой пароль — добавь цифры или символы'
  }
  if (m.includes('email rate limit') || m.includes('over_email_send_rate_limit')) {
    return 'Слишком много попыток. Подожди минуту и попробуй снова.'
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Слишком много попыток. Подожди немного.'
  }
  if (m.includes('invalid email')) {
    return 'Неверный формат email'
  }
  if (m.includes('signup is disabled')) {
    return 'Регистрация временно отключена'
  }
  if (m.includes('network') || m.includes('fetch failed')) {
    return 'Нет соединения. Проверь интернет.'
  }
  if (m.includes('unauthorized')) {
    return 'Неверный логин или пароль'
  }
  return message
}
