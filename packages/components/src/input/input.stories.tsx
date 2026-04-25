import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, type JSX } from "solid-js";
import AlertCircle from "lucide-solid/icons/alert-circle";
import AtSign from "lucide-solid/icons/at-sign";
import Check from "lucide-solid/icons/check";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import FolderOpen from "lucide-solid/icons/folder-open";
import KeyRound from "lucide-solid/icons/key-round";
import Lock from "lucide-solid/icons/lock";
import Mail from "lucide-solid/icons/mail";
import Search from "lucide-solid/icons/search";
import User from "lucide-solid/icons/user";

import { Input, type InputProps } from "./input";
import { Button } from "../button/button";
import { Label } from "../label/label";
import { Kbd } from "../kbd/kbd";

const meta = {
    title: "UI/Input",
    component: Input,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
        type: {
            control: "select",
            options: [
                "text",
                "email",
                "password",
                "number",
                "search",
                "url",
                "tel",
            ],
        },
        disabled: { control: "boolean" },
        readOnly: { control: "boolean" },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-start gap-6">
        <span class="pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Field = (props: { children: JSX.Element; class?: string }) => (
    <div class={`relative ${props.class ?? "w-80"}`}>{props.children}</div>
);

export const Playground: Story = {
    args: {
        placeholder: "Type something",
        type: "text",
        disabled: false,
        readOnly: false,
    },
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const Types: Story = {
    render: () => (
        <Frame>
            <Row label="text">
                <Field>
                    <Input placeholder="moondust-companion" />
                </Field>
            </Row>
            <Row label="email">
                <Field>
                    <Input type="email" placeholder="you@example.com" />
                </Field>
            </Row>
            <Row label="password">
                <Field>
                    <Input
                        type="password"
                        value="hunter2hunter2hunter2"
                    />
                </Field>
            </Row>
            <Row label="number">
                <Field>
                    <Input
                        type="number"
                        value="4096"
                        min={1}
                        max={32768}
                    />
                </Field>
            </Row>
            <Row label="search">
                <Field>
                    <Input type="search" placeholder="Search threads" />
                </Field>
            </Row>
            <Row label="url">
                <Field>
                    <Input
                        type="url"
                        placeholder="https://github.com/org/repo"
                    />
                </Field>
            </Row>
            <Row label="tel">
                <Field>
                    <Input type="tel" placeholder="+1 555 555 5555" />
                </Field>
            </Row>
        </Frame>
    ),
};

export const States: Story = {
    render: () => (
        <Frame>
            <Row label="empty">
                <Field>
                    <Input placeholder="moondust-companion" />
                </Field>
            </Row>
            <Row label="filled">
                <Field>
                    <Input value="moondust-companion" />
                </Field>
            </Row>
            <Row label="autofocus">
                <Field>
                    <Input
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autofocus
                        placeholder="Click into the story to refocus"
                    />
                </Field>
            </Row>
            <Row label="readonly">
                <Field>
                    <Input
                        readOnly
                        value="/Users/leo/code/moondust-companion"
                    />
                </Field>
            </Row>
            <Row label="disabled">
                <Field>
                    <Input disabled placeholder="Provider not connected" />
                </Field>
            </Row>
            <Row label="invalid">
                <div class="w-80 space-y-1.5">
                    <Field>
                        <Input
                            value="not-an-email"
                            class="border-flare-500 focus-visible:border-flare-400 focus-visible:ring-flare-400/40"
                        />
                    </Field>
                    <p class="flex items-center gap-1.5 text-xs text-flare-400">
                        <AlertCircle size={12} />
                        Enter a valid email address
                    </p>
                </div>
            </Row>
            <Row label="valid">
                <div class="w-80 space-y-1.5">
                    <Field>
                        <Input
                            value="leo@moondust.dev"
                            class="border-starlight-400/60 focus-visible:border-starlight-400 focus-visible:ring-starlight-400/40"
                        />
                    </Field>
                    <p class="flex items-center gap-1.5 text-xs text-starlight-300">
                        <Check size={12} />
                        Looks good
                    </p>
                </div>
            </Row>
        </Frame>
    ),
};

export const WithLabel: Story = {
    render: () => (
        <Frame>
            <Row label="basic">
                <div class="w-80">
                    <Label for="ks-name">Project name</Label>
                    <Input id="ks-name" placeholder="moondust-companion" />
                </div>
            </Row>
            <Row label="hint">
                <div class="w-80">
                    <Label for="ks-handle">Handle</Label>
                    <Input id="ks-handle" placeholder="leo" />
                    <p class="mt-1.5 text-xs text-void-400">
                        Lowercase letters, numbers, and hyphens.
                    </p>
                </div>
            </Row>
            <Row label="error">
                <div class="w-80">
                    <Label
                        for="ks-error"
                        class="text-flare-400"
                    >
                        Email
                    </Label>
                    <Input
                        id="ks-error"
                        type="email"
                        value="not-an-email"
                        class="border-flare-500 focus-visible:border-flare-400 focus-visible:ring-flare-400/40"
                    />
                    <p class="mt-1.5 flex items-center gap-1.5 text-xs text-flare-400">
                        <AlertCircle size={12} />
                        Enter a valid email address
                    </p>
                </div>
            </Row>
        </Frame>
    ),
};

export const WithIcon: Story = {
    render: () => (
        <Frame>
            <Row label="leading">
                <div class="space-y-3">
                    <Field>
                        <Mail
                            size={14}
                            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                        />
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            class="pl-9"
                        />
                    </Field>
                    <Field>
                        <User
                            size={14}
                            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                        />
                        <Input placeholder="Handle" class="pl-9" />
                    </Field>
                    <Field>
                        <DollarSign
                            size={14}
                            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                        />
                        <Input
                            type="number"
                            placeholder="0.00"
                            class="pl-9 font-mono tabular-nums"
                        />
                    </Field>
                </div>
            </Row>
            <Row label="trailing">
                <div class="space-y-3">
                    <Field>
                        <Input
                            type="search"
                            placeholder="Search threads"
                            class="pr-9"
                        />
                        <Search
                            size={14}
                            class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-void-500"
                        />
                    </Field>
                    <Field>
                        <Input
                            value="leo@moondust.dev"
                            class="pr-9"
                        />
                        <Check
                            size={14}
                            class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-starlight-300"
                        />
                    </Field>
                </div>
            </Row>
            <Row label="reveal">
                <PasswordReveal />
            </Row>
            <Row label="api key">
                <ApiKeyReveal />
            </Row>
        </Frame>
    ),
};

export const WithShortcut: Story = {
    render: () => (
        <Frame>
            <Row label="search">
                <Field class="w-96">
                    <Search
                        size={14}
                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                    />
                    <Input
                        type="search"
                        placeholder="Search threads, files, providers"
                        class="px-9"
                    />
                    <span class="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>K</Kbd>
                    </span>
                </Field>
            </Row>
            <Row label="palette">
                <Field class="w-96">
                    <Input
                        placeholder="Run command"
                        class="font-mono pr-12"
                    />
                    <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                        <Kbd>↵</Kbd>
                    </span>
                </Field>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Frame>
            <Row label="narrow">
                <Field class="w-24">
                    <Input
                        type="number"
                        value="4096"
                        class="text-right font-mono tabular-nums"
                    />
                </Field>
            </Row>
            <Row label="default">
                <Field>
                    <Input placeholder="moondust-companion" />
                </Field>
            </Row>
            <Row label="wide">
                <Field class="w-full max-w-2xl">
                    <Input
                        readOnly
                        value="/Users/leo/code/moondust-companion/internal/v2/app/project.go"
                        class="font-mono"
                    />
                </Field>
            </Row>
            <Row label="inline">
                <div class="flex w-full max-w-md items-center gap-2">
                    <Field class="flex-1">
                        <Input value="origin/main" class="font-mono" />
                    </Field>
                    <Button size="sm" variant="secondary">
                        Save
                    </Button>
                </div>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
                {/* Sign in */}
                <section>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Sign in
                    </p>
                    <div class="border border-void-700 bg-void-900 p-6">
                        <h3 class="mb-1 text-base font-semibold tracking-tight text-void-50">
                            Welcome back
                        </h3>
                        <p class="mb-5 text-sm text-void-400">
                            Sign in to continue with Moondust.
                        </p>
                        <div class="mb-4">
                            <Label for="ic-email">Email</Label>
                            <Field class="w-full">
                                <AtSign
                                    size={14}
                                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                                />
                                <Input
                                    id="ic-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    class="pl-9"
                                />
                            </Field>
                        </div>
                        <div class="mb-6">
                            <div class="mb-1.5 flex items-baseline justify-between">
                                <Label for="ic-pw" class="mb-0">
                                    Password
                                </Label>
                                <Button variant="link" class="text-xs">
                                    Forgot?
                                </Button>
                            </div>
                            <Field class="w-full">
                                <Lock
                                    size={14}
                                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                                />
                                <Input
                                    id="ic-pw"
                                    type="password"
                                    value="hunter2hunter2"
                                    class="px-9"
                                />
                            </Field>
                        </div>
                        <Button class="w-full">Sign in</Button>
                    </div>
                </section>

                {/* Project settings */}
                <section>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Project settings
                    </p>
                    <div class="border border-void-700 bg-void-900 p-6">
                        <div class="mb-5">
                            <Label for="ic-name">Name</Label>
                            <Input
                                id="ic-name"
                                value="moondust-companion"
                            />
                        </div>
                        <div class="mb-5">
                            <Label for="ic-path">Local path</Label>
                            <Field class="w-full">
                                <FolderOpen
                                    size={14}
                                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                                />
                                <Input
                                    id="ic-path"
                                    readOnly
                                    value="/Users/leo/code/moondust-companion"
                                    class="pl-9 font-mono"
                                />
                            </Field>
                        </div>
                        <div class="mb-5">
                            <Label for="ic-key">Anthropic API key</Label>
                            <ApiKeyReveal id="ic-key" />
                        </div>
                        <div class="mb-6 grid grid-cols-2 gap-3">
                            <div>
                                <Label for="ic-temp">Temperature</Label>
                                <Input
                                    id="ic-temp"
                                    type="number"
                                    value="0.7"
                                    step={0.1}
                                    min={0}
                                    max={2}
                                    class="text-right font-mono tabular-nums"
                                />
                            </div>
                            <div>
                                <Label for="ic-tokens">Max tokens</Label>
                                <Input
                                    id="ic-tokens"
                                    type="number"
                                    value="4096"
                                    class="text-right font-mono tabular-nums"
                                />
                            </div>
                        </div>
                        <div class="flex items-center justify-end gap-2">
                            <Button variant="ghost">Cancel</Button>
                            <Button>Save changes</Button>
                        </div>
                    </div>
                </section>

                {/* Search bar */}
                <section class="lg:col-span-2">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Command palette
                    </p>
                    <div class="border border-void-700 bg-void-900 p-3">
                        <Field class="w-full">
                            <Search
                                size={14}
                                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                            />
                            <Input
                                type="search"
                                placeholder="Search threads, files, providers"
                                class="px-9"
                            />
                            <span class="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1">
                                <Kbd>⌘</Kbd>
                                <Kbd>K</Kbd>
                            </span>
                        </Field>
                    </div>
                </section>
            </div>
        </div>
    ),
};

const PasswordReveal = () => {
    const [show, setShow] = createSignal(false);
    return (
        <Field>
            <Lock
                size={14}
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
            />
            <Input
                type={show() ? "text" : "password"}
                value="hunter2hunter2hunter2"
                class="px-9"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show() ? "Hide password" : "Show password"}
                class="absolute right-2 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center p-1 text-void-400 transition-colors duration-100 hover:text-void-100"
            >
                {show() ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </Field>
    );
};

const ApiKeyReveal = (props: { id?: string }) => {
    const [show, setShow] = createSignal(false);
    return (
        <Field class="w-full">
            <KeyRound
                size={14}
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
            />
            <Input
                id={props.id}
                type={show() ? "text" : "password"}
                value="sk-ant-api03-aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                class="px-9 font-mono"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show() ? "Hide key" : "Show key"}
                class="absolute right-2 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center p-1 text-void-400 transition-colors duration-100 hover:text-void-100"
            >
                {show() ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </Field>
    );
};
