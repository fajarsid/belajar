import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import UserForm from '@/components/user-form';
import { create, index, store } from '@/routes/users';

export default function CreateUser() {
    return (
        <>
            <Head title="Add user" />
            <div className="p-4">
                <Heading title="Add user" />
                <UserForm form={store.form()} submitLabel="Create user" />
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Add user', href: create() },
    ],
};
