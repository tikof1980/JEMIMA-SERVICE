import ProtectedPage from '../components/ProtectedPage';

export default function ProfilePage() {
  return (
    <ProtectedPage>
      {(me) => (
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>Mon profil</h1>
          <p>Nom : {me.fullName}</p>
          <p>Email : {me.email}</p>
          <p style={{ color: '#666' }}>
            La modification du profil (nom, photo, mot de passe) sera branchée sur les
            endpoints /users lors de leur finalisation.
          </p>
        </main>
      )}
    </ProtectedPage>
  );
}
