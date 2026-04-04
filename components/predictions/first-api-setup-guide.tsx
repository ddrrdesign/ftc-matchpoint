import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { FIRST_FTC_API_DOCS_URL } from "@/lib/ftc-api/event-presentation";

const FIRST_API_SERVICES =
  "https://ftc-events.firstinspires.org/services/API";
const VERCEL_ENV_DOCS =
  "https://vercel.com/docs/projects/environment-variables";
const SWAGGER_V2 =
  "https://ftc-events.firstinspires.org/swagger/v2.0/swagger.json";

function EnvName({ children }: { children: string }) {
  return (
    <code className="rounded-md border border-white/15 bg-black/30 px-2 py-0.5 font-mono text-[13px] text-violet-100/95">
      {children}
    </code>
  );
}

/**
 * Full on-page instructions so operators can configure FIRST API without leaving
 * the site for the main checklist (external links only for FIRST / Vercel docs).
 */
export function FirstApiSetupGuide() {
  return (
    <section
      id="first-api-setup"
      className="scroll-mt-24"
      aria-labelledby="first-api-setup-title"
    >
      <GlassCard className="max-w-3xl border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">
          Настройка сервера
        </p>
        <h2
          id="first-api-setup-title"
          className="mt-2 text-xl font-semibold text-amber-50 sm:text-2xl"
        >
          Как подключить FIRST Events API к этому сайту
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-amber-100/88">
          Режим <strong className="font-medium text-amber-50">Event analysis</strong> и
          каталог ивентов на{" "}
          <Link href="/events" className="text-amber-200 underline hover:text-amber-100">
            странице Events
          </Link>{" "}
          берут данные только с вашего сервера (Vercel / Node). Ключи в браузере не
          вводятся — их задают в переменных окружения.
        </p>

        <ol className="mt-6 space-y-5 text-sm leading-relaxed text-amber-50/95">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              1
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">Получите логин и ключ API</p>
              <p className="mt-1.5 text-amber-100/80">
                Зарегистрируйте доступ в экосистеме FIRST для FTC Events API (пара{" "}
                <strong className="font-normal text-amber-100">username + key</strong>
                ). Официальная точка входа и правила использования:
              </p>
              <ul className="mt-2 space-y-1.5 text-amber-100/75">
                <li>
                  <a
                    href={FIRST_API_SERVICES}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FTC Event Web — API / Services
                  </a>{" "}
                  <span className="text-amber-100/50">(firstinspires.org)</span>
                </li>
                <li>
                  <a
                    href={FIRST_FTC_API_DOCS_URL}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Документация REST API v2.0
                  </a>
                </li>
                <li>
                  <a
                    href={SWAGGER_V2}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAPI (Swagger) v2.0
                  </a>{" "}
                  — схемы запросов и ответов
                </li>
              </ul>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              2
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">
                Добавьте переменные в хостинг (например Vercel)
              </p>
              <p className="mt-1.5 text-amber-100/80">
                В панели проекта:{" "}
                <strong className="font-normal text-amber-100">
                  Settings → Environment Variables
                </strong>
                . Создайте как минимум:
              </p>
              <ul className="mt-3 space-y-2 font-mono text-[13px] text-amber-50/95">
                <li className="flex flex-wrap items-center gap-2">
                  <EnvName>FTC_API_USERNAME</EnvName>
                  <span className="text-amber-100/60 font-sans text-sm">
                    — логин API
                  </span>
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <EnvName>FTC_API_KEY</EnvName>
                  <span className="text-amber-100/60 font-sans text-sm">
                    — секретный ключ
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-amber-100/75">
                Рекомендуется включить для{" "}
                <strong className="font-normal text-amber-100">Production</strong> и при
                необходимости для{" "}
                <strong className="font-normal text-amber-100">Preview</strong>, если
                тестируете PR. Справка Vercel:{" "}
                <a
                  href={VERCEL_ENV_DOCS}
                  className="text-amber-200 underline hover:text-amber-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Environment Variables
                </a>
                .
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              3
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">Сезон API (по желанию)</p>
              <p className="mt-1.5 text-amber-100/80">
                Если список ивентов «не тот год», задайте{" "}
                <EnvName>FTC_SEASON_YEAR</EnvName> (год, который ожидает REST API для
                текущей игры). Для каталога предиктов можно переопределить{" "}
                <EnvName>FTC_PREDICTIONS_API_SEASONS</EnvName> (например{" "}
                <code className="text-amber-100/90">2026,2025</code>).
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              4
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">Пересоберите деплой</p>
              <p className="mt-1.5 text-amber-100/80">
                После сохранения переменных выполните{" "}
                <strong className="font-normal text-amber-100">Redeploy</strong> последнего
                деплоя в Vercel или сделайте пустой commit / push — иначе процесс не
                подхватит новые значения.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-xs font-bold text-emerald-100">
              ✓
            </span>
            <div className="min-w-0">
              <p className="font-medium text-emerald-100/95">Проверка на этом сайте</p>
              <p className="mt-1.5 text-amber-100/80">
                Сервисная проверка (JSON):{" "}
                <Link
                  href="/api/ftc-status"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  /api/ftc-status
                </Link>{" "}
                — <code className="text-amber-100/90">credentialsPresent</code> и{" "}
                <code className="text-amber-100/90">listingsOk</code> без выдачи секретов.
                Затем{" "}
                <Link
                  href="/events"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  Events
                </Link>{" "}
                и{" "}
                <Link
                  href="/predictions#event-analysis"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  Predictions → Event analysis
                </Link>
                .
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-6 border-t border-amber-400/15 pt-5 text-sm text-amber-100/70">
          <p>
            <strong className="font-medium text-amber-100">Overall analysis</strong> на
            этой странице использует FTC Scout и может работать без FIRST API; Event
            analysis — только с настроенными{" "}
            <EnvName>FTC_API_USERNAME</EnvName> и <EnvName>FTC_API_KEY</EnvName>.
          </p>
        </div>
      </GlassCard>
    </section>
  );
}

/** Short pointer when the full guide is rendered above on the same page. */
export function FirstApiSetupPointer() {
  return (
    <p className="text-sm leading-relaxed text-white/50">
      Инструкция по ключам и деплою — в блоке{" "}
      <a
        href="#first-api-setup"
        className="font-medium text-violet-300 underline hover:text-violet-200"
      >
        «Как подключить FIRST Events API»
      </a>{" "}
      выше на этой странице. После настройки обновите страницу.
    </p>
  );
}
