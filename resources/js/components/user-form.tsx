import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/users';

type Props = {
    form: { action: string; method: 'get' | 'post' };
    user?: { name: string; email: string };
    submitLabel: string;
};

export default function UserForm({ form, user, submitLabel }: Props) {
    const isEdit = user !== undefined;

    return (
        <Form {...form} className="max-w-xl space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={user?.name}
                            required
                            autoComplete="off"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            defaultValue={user?.email}
                            required
                            autoComplete="off"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {isEdit ? 'New password (optional)' : 'Password'}
                        </Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            required={!isEdit}
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            required={!isEdit}
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} data-test="save-user-button">
                            {submitLabel}
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={index()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
