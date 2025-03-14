import { Avatar, Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";

function UserAccount() {
  return (
    <Navbar fluid rounded>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
        >
          <Dropdown.Header>
            <span className="block text-sm">Bonnie Green</span>
            <p>Accounting</p>
          </Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
    </Navbar>
  );
}

export default UserAccount;