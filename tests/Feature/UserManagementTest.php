<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->create();
});

test('guests are redirected to login for every user route', function () {
    $user = User::factory()->create();

    $this->get(route('users.index'))->assertRedirect(route('login'));
    $this->get(route('users.create'))->assertRedirect(route('login'));
    $this->post(route('users.store'))->assertRedirect(route('login'));
    $this->get(route('users.edit', $user))->assertRedirect(route('login'));
    $this->put(route('users.update', $user))->assertRedirect(route('login'));
    $this->delete(route('users.destroy', $user))->assertRedirect(route('login'));

    expect($user->fresh())->not->toBeNull();
});

test('users list is paginated and never exposes passwords', function () {
    User::factory()->count(12)->create();

    $this->actingAs($this->admin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->has('users.data', 10)
            ->where('users.total', 13)
            ->missing('users.data.0.password'));
});

test('users list can be searched by name or email', function () {
    User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
    User::factory()->create(['name' => 'Citra', 'email' => 'citra@example.com']);

    $this->actingAs($this->admin)
        ->get(route('users.index', ['search' => 'budi']))
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.name', 'Budi Santoso'));

    $this->actingAs($this->admin)
        ->get(route('users.index', ['search' => 'citra@']))
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.name', 'Citra'));
});

test('users list ignores an unsupported sort column', function () {
    $this->actingAs($this->admin)
        ->get(route('users.index', ['sort' => 'password', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'id'));
});

test('a user can be created with a hashed password', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertRedirect(route('users.index'));

    $created = User::where('email', 'new@example.com')->firstOrFail();

    expect($created->password)->not->toBe('password')
        ->and(Hash::check('password', $created->password))->toBeTrue();
});

test('creating a user validates the input', function (array $payload, string|array $invalid) {
    $this->actingAs($this->admin)
        ->post(route('users.store'), $payload)
        ->assertSessionHasErrors($invalid);
})->with([
    'missing name' => [['email' => 'a@example.com', 'password' => 'password', 'password_confirmation' => 'password'], 'name'],
    'invalid email' => [['name' => 'A', 'email' => 'nope', 'password' => 'password', 'password_confirmation' => 'password'], 'email'],
    'missing password' => [['name' => 'A', 'email' => 'a@example.com'], 'password'],
    'password not confirmed' => [['name' => 'A', 'email' => 'a@example.com', 'password' => 'password', 'password_confirmation' => 'other'], 'password'],
]);

test('a duplicate email is rejected on create', function () {
    $existing = User::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Dup',
            'email' => $existing->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasErrors('email');
});

test('the edit page is prefilled without the password', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('users.edit', $user))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/edit')
            ->where('user.email', $user->email)
            ->missing('user.password'));
});

test('editing a missing user returns 404', function () {
    $this->actingAs($this->admin)->get(route('users.edit', 999999))->assertNotFound();
});

test('a user can be updated while keeping their own email', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), ['name' => 'Renamed', 'email' => $user->email])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    expect($user->fresh()->name)->toBe('Renamed');
});

test('another users email is rejected on update', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), ['name' => $user->name, 'email' => $other->email])
        ->assertSessionHasErrors('email');
});

test('a blank password on update keeps the old password', function () {
    $user = User::factory()->create();
    $oldHash = $user->password;

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), [
            'name' => 'Same Pass',
            'email' => $user->email,
            'password' => '',
            'password_confirmation' => '',
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->password)->toBe($oldHash);
});

test('a new password on update is stored hashed', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasNoErrors();

    $stored = $user->fresh()->password;

    expect($stored)->not->toBe('new-password-123')
        ->and(Hash::check('new-password-123', $stored))->toBeTrue();
});

test('a user can be deleted', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('users.destroy', $user))
        ->assertRedirect(route('users.index'));

    $this->assertModelMissing($user);
});

test('deleting a missing user returns 404', function () {
    $this->actingAs($this->admin)->delete(route('users.destroy', 999999))->assertNotFound();
});

test('the signed in account cannot be deleted from the user list', function () {
    $this->actingAs($this->admin)
        ->delete(route('users.destroy', $this->admin))
        ->assertRedirect(route('users.index'));

    $this->assertModelExists($this->admin);
});
