import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import UserForm from '@/components/user-form';
import { edit, index, update } from '@/routes/users';

type Props = {
    user: { id: number; name: string; email: string };
};

export default function EditUser({ user }: Props) {
    return (
        <>
            <Head title="Edit user" />
            <div className="p-4">
                <Heading
                    title="Edit user"
                    description="Leave the password blank to keep the current one"
                />
                <UserForm
                    form={update.form(user.id)}
                    user={user}
                    submitLabel="Save changes"
                />
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Edit user', href: edit(0) },
    ],
};
