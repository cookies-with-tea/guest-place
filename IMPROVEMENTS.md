# Guest Place — Открытые улучшения (server + admin-panel)

Предыдущие списки (`git log -- IMPROVEMENTS.md`) закрыты полностью — детали
и доказательства в git-истории этого файла. `client/` не в скоупе (по
решению владельца продукта).

Отмечайте выполненные пункты `[x]` по ходу работы или просто удаляйте их.

---

## 1. Токены авторизации в admin-panel хранятся в localStorage, а не в cookie

`access_token` сейчас лежит в `localStorage` (`gp_access_token`) и шлётся
руками через заголовок `Authorization` (`packages/lib/src/api/fetch.ts`,
`useAuth.ts`, и — после фикса `useEntityLock.ts` в этом проходе — там же).
Договорённость — перейти полностью на HttpOnly-cookie (как уже сделано для
`refresh_token`, см. `server/src/auth/cookies.rs` и комментарий в
`api/fetch.ts:56-60`), без `localStorage` для токенов вообще.

Это отдельная, более крупная задача: нужно научить сервер выставлять
`access_token` как HttpOnly-cookie при login/refresh, `auth_middleware`
читать его из cookie вместо заголовка (или читать оба способа на переходный
период), и переписать все fetch-вызовы в admin-panel (не только
`api/fetch.ts`, но и `useEntityLock.ts`, `router/index.ts` — `beforeEach`
читает токен из localStorage напрямую для проверки `isAuthenticated`, и
другие прямые обращения к `gp_access_token`) под `credentials: 'include'`
без ручного заголовка.

- [ ] Спроектировать и реализовать переход access_token на HttpOnly-cookie,
      убрать `localStorage.getItem('gp_access_token')`/`setItem` везде.
