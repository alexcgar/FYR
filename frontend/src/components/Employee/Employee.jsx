import React from "react";
import {
    MDBBtn,
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBRow,
    MDBCol,
} from "mdb-react-ui-kit";

const Employee = () => {
    return (
        <MDBCol md="12" lg="12" xl="6">
            <MDBContainer fluid className="m-1">
                <MDBCard className="shadow-5">
                    <MDBCardBody className="text-center bg-dark text-white">
                        <h5 className="mb-4">Employee Details</h5>
                        <p><strong>CodCompany:</strong> 1</p>
                        <p><strong>IDWorkOrder:</strong> 696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc</p>
                        <p><strong>IDEmployee:</strong> f9aaec71-d1d2-4fd7-8317-24950668e717</p>
                        <MDBBtn color="light" className="mt-3">More Info</MDBBtn>
                    </MDBCardBody>
                </MDBCard>
            </MDBContainer>
        </MDBCol>
    );
};

export default Employee;
