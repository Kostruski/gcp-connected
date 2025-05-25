'use client';

import { Row, Col, Container, Card } from 'react-bootstrap';
import AuthUi from '../../components/auth-ui';
import { useEffect, useRef } from 'react'; // Import useRef

const AuthPage = () => {
  const authContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the container element exists
    const authContainer = authContainerRef.current;
    if (!authContainer) {
      console.warn('FirebaseUI auth container not found.');
      return;
    }

    // Function to apply styles to FirebaseUI elements
    const applyFirebaseUiStyles = () => {
      const buttons = authContainer.querySelectorAll('.firebaseui-button');
      const emailInputWrappers = authContainer.querySelectorAll(
        '.firebaseui-textfield ',
      );

      emailInputWrappers.forEach((wrapper) => {
        const inputLabel = wrapper?.querySelector('label');
        const textInput = wrapper?.querySelector('input');

        if (wrapper) {
          wrapper.classList.add('my-4');
        }

        if (inputLabel) {
          inputLabel.classList.add('form-label');
        }

        if (textInput) {
          textInput.classList.add('form-control');
        }
      });

      buttons.forEach((button) => {
        if (button) {
          button.classList.add('btn', 'btn-primary', 'w-100', 'my-4');
        }
      });

      const title = authContainer.querySelector('.firebaseui-card-header');
      if (title) {
        title.classList.add('text-center', 'fs-3', 'mb-4');
      }

      const errorMessage = authContainer.querySelector(
        '.firebaseui-error-message',
      );

      if (errorMessage) {
        errorMessage.classList.add('text-danger', 'mt-2');
      }
    };

    applyFirebaseUiStyles();

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          applyFirebaseUiStyles();
          break;
        }
      }
    });

    observer.observe(authContainer, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col />
        <Col>
          <Card className="p-4">
            <div id="firebaseui-auth-container" ref={authContainerRef}></div>
            <AuthUi />
          </Card>
        </Col>
        <Col />
      </Row>
    </Container>
  );
};

export default AuthPage;
